import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Cliente } from '../../model/cliente';
import { DetalleReserva } from '../../model/detalle-reserva';
import { Libro } from '../../model/libro';
import { Reserva } from '../../model/reserva';
import { ReservaWizardAiForm } from '../../forms/reserva-wizard-ai.form';
import { ReservaWizardAiStore } from '../../store/reserva-wizard-ai.store';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  imports: [
    DatePipe,
    NgClass,
    FormRoot,
    FormField,
    MatStepperModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-reserva-wizard-ai',
  styleUrl: './reserva-wizard-ai.component.css',
  templateUrl: './reserva-wizard-ai.component.html',
  providers: [ReservaWizardAiForm, ReservaWizardAiStore, provideNativeDateAdapter()]
})
export class ReservaWizardAiComponent {
  protected readonly reservaForm = inject(ReservaWizardAiForm);
  private readonly reservaWizardStore = inject(ReservaWizardAiStore);
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly $stepper = viewChild<MatStepper>('stepper');
  protected readonly today = new Date();

  protected readonly $clientes = this.reservaWizardStore.$clientes;
  protected readonly $libros = this.reservaWizardStore.$libros;
  protected readonly $loading = this.reservaWizardStore.$loading;
  protected readonly $selectedLibro = this.reservaWizardStore.$selectedLibro;

  protected readonly $selectedCliente = computed(() => {
    const idCliente = this.reservaForm.$model().idCliente;
    return this.$clientes().find(cliente => cliente.idCliente === idCliente) ?? null;
  });

  protected readonly isPrincipalValid = computed(() => !this.reservaForm.isInvalid());

  protected readonly $canSave = computed(() =>
    this.isPrincipalValid() && this.$selectedCliente() !== null && this.$selectedLibro() !== null
  );

  constructor() {
    this.initializeNotificationEffect();
  }

  private initializeNotificationEffect() {
    effect(() => {
      const message = this.notificationService.$message();
      if (message) {
        this.snackBar.open(message, 'INFO', {
          duration: 3000,
          horizontalPosition: 'left',
          verticalPosition: 'top'
        });
        this.notificationService.clear();
      }
    });
  }

  isSelected(libro: Libro) {
    return this.$selectedLibro()?.idLibro === libro.idLibro;
  }

  selectLibro(libro: Libro) {
    this.reservaWizardStore.selectLibro(libro);
  }

  save() {
    if (!this.$canSave()) return;

    const cliente = this.$selectedCliente();
    const libro = this.$selectedLibro();
    const fechaReserva = this.reservaForm.value().fechaReserva;
    if (!cliente || !libro || !fechaReserva) return;

    this.reservaWizardStore.save(this.buildReserva(cliente, libro, fechaReserva)).subscribe({
      next: () => {
        this.notificationService.notify('CREATED');
        this.reset();
      },
      error: () => this.notificationService.notify('ERROR')
    });
  }

  private buildReserva(cliente: Cliente, libro: Libro, fechaReserva: Date): Reserva {
    const reserva = new Reserva();
    reserva.fechaReserva = this.toLocalDateTime(fechaReserva);
    reserva.cliente = cliente;

    const detalle = new DetalleReserva();
    detalle.libro = libro;
    reserva.detalles = [detalle];

    return reserva;
  }

  private toLocalDateTime(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private reset() {
    this.reservaForm.reset();
    this.reservaWizardStore.clearLibro();
    this.$stepper()?.reset();
  }
}

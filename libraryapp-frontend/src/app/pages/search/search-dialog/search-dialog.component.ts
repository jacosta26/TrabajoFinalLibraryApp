import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Reserva } from '../../../model/reserva';
import { SearchDialogStore } from '../../../store/search-dialog.store';

@Component({
  imports: [
    DatePipe,
    MatDialogModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-search-dialog',
  styleUrl: './search-dialog.component.css',
  templateUrl: './search-dialog.component.html',
  providers: [SearchDialogStore]
})
export class SearchDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SearchDialogComponent>);
  private readonly searchDialogStore = inject(SearchDialogStore);

  protected readonly data = inject<Reserva>(MAT_DIALOG_DATA);

  protected readonly $reserva = computed(() => this.searchDialogStore.$reserva() ?? this.data);

  constructor() {
    if (this.data?.idReserva) {
      this.searchDialogStore.load(this.data.idReserva);
    }
  }

  close() {
    this.dialogRef.close();
  }
}

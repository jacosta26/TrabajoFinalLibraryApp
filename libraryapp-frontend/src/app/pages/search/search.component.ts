import { DatePipe } from '@angular/common';
import { Component, effect, inject, viewChild } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SearchForm } from '../../forms/search.form';
import { FilterReservaDTO } from '../../model/filter-reserva-dto';
import { Reserva } from '../../model/reserva';
import { SearchStore } from '../../store/search.store';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';

@Component({
  imports: [
    DatePipe,
    FormRoot,
    FormField,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-search',
  styleUrl: './search.component.css',
  templateUrl: './search.component.html',
  providers: [SearchForm, SearchStore, provideNativeDateAdapter()]
})
export class SearchComponent {
  protected readonly searchForm = inject(SearchForm);
  private readonly searchStore = inject(SearchStore);
  private readonly dialog = inject(MatDialog);

  protected readonly $tabs = viewChild<MatTabGroup>('tabs');
  protected readonly dataSource = new MatTableDataSource<Reserva>();
  protected readonly displayedColumns: string[] = ['cliente', 'libro', 'date', 'actions'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.searchStore.$reservaData();
    });
  }

  search() {
    const index = this.$tabs()?.selectedIndex ?? 0;
    const model = this.searchForm.value();

    if (index === 0) {
      this.searchStore.searchByOthers(new FilterReservaDTO(model.cedula, (model.fullname ?? '').toLowerCase()));
      return;
    }

    if (!model.startDate || !model.endDate) return;

    this.searchStore.searchByDates(
      this.toLocalDateTime(model.startDate),
      this.toLocalDateTime(model.endDate)
    );
  }

  libroTitles(reserva: Reserva) {
    return (reserva.detalles ?? []).map(detalle => detalle.libro?.title).join(', ');
  }

  viewDetails(reserva: Reserva) {
    this.dialog.open(SearchDialogComponent, { data: reserva });
  }

  private toLocalDateTime(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}

import { Component, effect, inject, viewChild } from '@angular/core';
import { ClienteStore } from '../../store/cliente.store';
import { NotificationService } from '../../shared/services/notification.service';
import { Cliente } from '../../model/cliente';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterOutlet,
    MatSnackBarModule
  ],
  selector: 'app-cliente',
  styleUrl: './cliente.component.css',
  templateUrl: './cliente.component.html',
  providers:[ClienteStore]
})
export class ClienteComponent {
  private readonly clienteStore = inject(ClienteStore);
  private readonly notificationService = inject(NotificationService);
  private readonly clienteService = inject(ClienteService)
  protected readonly dataSource = new MatTableDataSource<Cliente>();
  protected $clientes = this.clienteStore.$clientes;
  protected displayedColumns: string[] = ['idCliente', 'nombres', 'apellidos', 'cedula', 'email', 'actions'];
  protected readonly $sort = viewChild(MatSort);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected $pageRequest = this.clienteStore.$pageRequest;  
  protected $totalElements = this.clienteStore.$totalElements;

  constructor() {
    this.setupTableEffect();
    this.setupNotificationEffect();
  }

  private setupTableEffect() {
    effect(() => {
      const data = this.$clientes();
      const s = this.$sort();

      this.dataSource.data = data;
      this.dataSource.sort = s;
    });
  }

  private setupNotificationEffect(){
    effect(() => {
      const message = this.notificationService.$message();
      if(message){
        this.snackBar.open(message, 'INFO', { duration: 3000, horizontalPosition: 'left', verticalPosition: 'top' });
        this.notificationService.clear();
      }
    });
  }

  applyFilter(e: any){
    const filterValue = e.target.value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  delete(idCliente: number) {
    this.dialog.open(ConfirmDialogComponent).afterClosed().subscribe( (confirmed)=> {
      if(!confirmed) return;
        
      this.clienteService.delete(idCliente).subscribe({
        next: () => {
          this.notificationService.notify('DELETED');
          this.clienteStore.reload();
        },
        error: () => this.notificationService.notify('ERROR')
      });
    });
  }

  changePage(e: any) {
    this.clienteStore.change(e.pageIndex, e.pageSize);
  }
}

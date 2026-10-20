import { Component, effect, inject, viewChild } from '@angular/core';
import { CategoriaStore } from '../../store/categoria.store';
import { NotificationService } from '../../shared/services/notification.service';
import { Categoria } from '../../model/categoria';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  selector: 'app-categoria',
  styleUrl: './categoria.component.css',
  templateUrl: './categoria.component.html',
  providers:[CategoriaStore]
})
export class CategoriaComponent {
  private readonly categoriaStore = inject(CategoriaStore);
  private readonly notificationService = inject(NotificationService);
  private readonly categoriaService = inject(CategoriaService)
  protected readonly dataSource = new MatTableDataSource<Categoria>();
  protected $categorias = this.categoriaStore.$categorias;
  protected displayedColumns: string[] = ['idCategoria', 'nombreCategoria', 'descripcionCategoria', 'estadoCategoria', 'actions'];
  protected readonly $sort = viewChild(MatSort);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected $pageRequest = this.categoriaStore.$pageRequest;  
  protected $totalElements = this.categoriaStore.$totalElements;


  constructor() {
    this.setupTableEffect();
    this.setupNotificationEffect();
  }
  
  private setupTableEffect() {
    effect(() => {
      const data = this.$categorias();
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

  delete(idCategoria: number) {
    this.dialog.open(ConfirmDialogComponent).afterClosed().subscribe( (confirmed)=> {
      if(!confirmed) return;
    
      this.categoriaService.delete(idCategoria).subscribe({
          next: () => {
            this.notificationService.notify('DELETED');
            this.categoriaStore.reload();
          },
          error: () => this.notificationService.notify('ERROR')
      });
    });
  }

  changePage(e: any) {
    this.categoriaStore.change(e.pageIndex, e.pageSize);
  }
}

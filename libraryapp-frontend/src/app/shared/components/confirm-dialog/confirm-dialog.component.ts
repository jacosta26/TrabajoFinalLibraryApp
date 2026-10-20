import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.component.css',
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onNoClick() {
    this.dialogRef.close(false);
  }
}

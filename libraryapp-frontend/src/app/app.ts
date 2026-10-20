import { Component, signal } from '@angular/core';
import { LayoutComponent } from './pages/layout/layout.component';

@Component({
  imports: [LayoutComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('libraryapp-frontend');
}

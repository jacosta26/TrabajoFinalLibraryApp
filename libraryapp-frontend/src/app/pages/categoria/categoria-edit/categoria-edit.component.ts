import { Component, computed, effect, inject } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriaForm } from '../../../forms/categoria.form';
import { CategoriaService } from '../../../services/categoria.service';
import { CategoriaStore } from '../../../store/categoria.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoriaEditStore } from '../../../store/categoria-edit.store';
import { Categoria } from '../../../model/categoria';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  imports: [
    FormRoot,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormField,
    RouterLink
  ],
  selector: 'app-categoria-edit',
  styleUrl: './categoria-edit.component.css',
  templateUrl: './categoria-edit.component.html',
  providers: [CategoriaForm, CategoriaEditStore]
})
export class CategoriaEditComponent {
  protected readonly categoriaForm = inject(CategoriaForm);
  private readonly route = inject(ActivatedRoute);
  private readonly categoriaEditStore = inject(CategoriaEditStore);
  private readonly categoriaService = inject(CategoriaService);
  private readonly categoriaStore = inject(CategoriaStore);
  private readonly router = inject(Router); 
  private readonly notificationService = inject(NotificationService);

  private readonly $params = toSignal(this.route.params, { initialValue: {} });

  protected $id = computed( () => {
    const id = this.$params()['id'];
    return id ? Number(id) : null;
  });

  protected $isEdit = computed(() => this.$id() !== null);

  constructor() {
    effect( ()=> {
      this.categoriaEditStore.setId(this.$id());
    });

    effect( ()=> {
      if(this.categoriaEditStore.categoriaResource.hasValue()) {
        this.categoriaForm.patch(this.categoriaEditStore.categoriaResource.value());
      }
    });
  }

  operate() {        
    if(this.categoriaForm.isInvalid()) return;

    const isEdit = this.$isEdit();
    const id = this.$id();
    const categoria: Categoria = this.categoriaForm.value();

    const operation$ = isEdit ? this.categoriaService.update(id, categoria) : this.categoriaService.save(categoria);

    operation$.subscribe( ()=> {
      this.categoriaStore.reload();
      this.notificationService.notify(isEdit ? 'UPDATED' : 'CREATED');
      this.router.navigate(['/pages/categoria']);      
    });

  }
}

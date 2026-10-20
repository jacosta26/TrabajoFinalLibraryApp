import { Service, signal } from "@angular/core";
import { Categoria } from "../model/categoria";
import { form, maxLength, minLength, required } from "@angular/forms/signals";

const emptyCategoria = ():Categoria => ({
    idCategoria: null,
    nombreCategoria: '',
    descripcionCategoria:  '',
    estadoCategoria: ''
});

@Service({autoProvided: false})
export class CategoriaForm {
    readonly $model = signal<Categoria>(emptyCategoria());

    readonly $form = form(this.$model, (path) => {
        required(path.nombreCategoria);
        minLength(path.nombreCategoria, 5);
        maxLength(path.nombreCategoria, 70);

        required(path.descripcionCategoria);
        minLength(path.descripcionCategoria, 15);
        maxLength(path.descripcionCategoria, 200);

        required(path.estadoCategoria);
        minLength(path.estadoCategoria, 5);
        maxLength(path.estadoCategoria, 20);
  });

  readonly isInvalid = () => this.$form().invalid();

  patch(categoria: Categoria) {
    this.$model.set(categoria);
  }

  value() {
    return this.$model();
  }

  reset() {
    this.$model.set(emptyCategoria());
  }
}
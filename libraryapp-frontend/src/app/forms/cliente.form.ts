import { Service, signal } from "@angular/core";
import { Cliente } from "../model/cliente";
import { email, form, maxLength, minLength, pattern, required } from "@angular/forms/signals";

const emptyCliente = ():Cliente => ({
    idCliente: null,
    nombres: '',
    apellidos: '',
    cedula: '',
    email: ''
});

@Service({autoProvided: false})
export class ClienteForm {
    readonly $model = signal<Cliente>(emptyCliente());

    readonly $form = form(this.$model, (path) => {
        required(path.nombres);
        minLength(path.nombres, 3);
        maxLength(path.nombres, 80);

        required(path.apellidos);
        minLength(path.apellidos, 2);
        maxLength(path.apellidos, 80);

        required(path.cedula);
        minLength(path.cedula, 5);
        maxLength(path.cedula, 20);
        pattern(path.cedula, /^[0-9]+$/);

        required(path.email);
        minLength(path.email, 11);
        maxLength(path.email, 60);
        email(path.email);
  });

  readonly isInvalid = () => this.$form().invalid();

  patch(cliente: Cliente) {
    this.$model.set(cliente);
  }

  value() {
    return this.$model();
  }

  reset() {
    this.$model.set(emptyCliente());
  }
}

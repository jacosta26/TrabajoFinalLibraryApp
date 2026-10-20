import { Service, signal } from "@angular/core";
import { Libro } from "../model/libro";
import { form, maxLength, minLength, pattern, required } from "@angular/forms/signals";

const emptyLibro = ():Libro => ({
    idLibro: null,
    title: '',
    nameAuthor: '',
    isbn: '',
    disponible: false,
    idCategoria: null
});

@Service({autoProvided: false})
export class LibroForm {
    readonly $model = signal<Libro>(emptyLibro());
    readonly $form = form(this.$model, (path) => {
        required(path.title);
        minLength(path.title, 5);
        maxLength(path.title, 150);

        required(path.nameAuthor);
        minLength(path.nameAuthor, 5);
        maxLength(path.nameAuthor, 80);

        required(path.isbn);
        minLength(path.isbn, 10);
        maxLength(path.isbn, 13);
        pattern(path.isbn, /^[0-9]{10,13}$/);

        required(path.disponible);

        required(path.idCategoria);
    });

    readonly isEdit = () => this.$model().idLibro > 0;

    readonly isInvalid = () => this.$form().invalid();

    patch(libro: Libro) {
        this.$model.set(libro ?? emptyLibro());
    }

    value() {
        return this.$model();
    }
}
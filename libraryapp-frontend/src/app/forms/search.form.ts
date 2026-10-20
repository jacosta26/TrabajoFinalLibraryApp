import { Service, signal } from "@angular/core";
import { form } from "@angular/forms/signals";

export interface SearchModel {
    cedula: string;
    fullname: string;
    startDate: Date | null;
    endDate: Date | null;
}

const emptySearch = (): SearchModel => ({
    cedula: '',
    fullname: '',
    startDate: null,
    endDate: null
});

@Service({autoProvided: false})
export class SearchForm {
    readonly $model = signal<SearchModel>(emptySearch());

    readonly $form = form(this.$model, () => {});

    value() {
        return this.$model();
    }

    reset() {
        this.$model.set(emptySearch());
    }
}

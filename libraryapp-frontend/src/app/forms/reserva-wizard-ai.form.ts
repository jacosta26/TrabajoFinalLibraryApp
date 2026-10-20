import { Service, signal } from "@angular/core";
import { form, required } from "@angular/forms/signals";

export interface ReservaWizardAiModel {
    idCliente: number | null;
    fechaReserva: Date | null;
}

const emptyReservaWizardAi = (): ReservaWizardAiModel => ({
    idCliente: null,
    fechaReserva: null
});

@Service({autoProvided: false})
export class ReservaWizardAiForm {
    readonly $model = signal<ReservaWizardAiModel>(emptyReservaWizardAi());

    readonly $form = form(this.$model, (path) => {
        required(path.idCliente);
        required(path.fechaReserva);
    });

    readonly isInvalid = () => this.$form().invalid();

    value() {
        return this.$model();
    }

    reset() {
        this.$model.set(emptyReservaWizardAi());
    }
}

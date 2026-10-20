import { httpResource } from "@angular/common/http";
import { inject, Service, signal } from "@angular/core";
import { Reserva } from "../model/reserva";
import { ReservaService } from "../services/reserva.service";

@Service({autoProvided: false})
export class SearchDialogStore {
    private readonly reservaService = inject(ReservaService);

    private readonly _idReserva = signal<number | undefined>(undefined);

    private readonly reservaResource = httpResource<Reserva>(() => {
        const id = this._idReserva();
        if (id === undefined) return undefined;
        return `${this.reservaService.resourceUrl}/${id}`;
    });

    readonly $reserva = this.reservaResource.value;
    readonly $loading = this.reservaResource.isLoading;
    readonly $error = this.reservaResource.error;

    load(idReserva: number) {
        this._idReserva.set(idReserva);
    }
}

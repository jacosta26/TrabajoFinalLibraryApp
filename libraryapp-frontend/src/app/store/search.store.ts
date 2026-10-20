import { httpResource } from "@angular/common/http";
import { effect, inject, Service, signal } from "@angular/core";
import { FilterReservaDTO } from "../model/filter-reserva-dto";
import { Reserva } from "../model/reserva";
import { ReservaService } from "../services/reserva.service";

interface DateRangeRequest {
    date1: string;
    date2: string;
}

@Service({autoProvided: false})
export class SearchStore {
    private readonly reservaService = inject(ReservaService);

    private readonly _dateRequest = signal<DateRangeRequest | undefined>(undefined);
    private readonly _reservaData = signal<Reserva[]>([]);

    readonly $reservaData = this._reservaData.asReadonly();

    private readonly datesResource = httpResource<Reserva[]>(() => {
        const request = this._dateRequest();
        if (!request) return undefined;
        return {
            url: `${this.reservaService.resourceUrl}/search/dates`,
            params: { date1: request.date1, date2: request.date2 }
        };
    }, { defaultValue: [] });

    constructor() {
        effect(() => {
            if (!this._dateRequest()) return;
            this._reservaData.set(this.datesResource.value() ?? []);
        });
    }

    searchByOthers(filter: FilterReservaDTO) {
        this._dateRequest.set(undefined);
        this.reservaService.searchByOthers(filter).subscribe({
            next: (reservas) => this._reservaData.set(reservas ?? []),
            error: () => this._reservaData.set([])
        });
    }

    searchByDates(date1: string, date2: string) {
        this._dateRequest.set({ date1, date2 });
    }
}

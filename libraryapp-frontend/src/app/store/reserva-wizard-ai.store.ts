import { httpResource } from "@angular/common/http";
import { computed, inject, Service, signal } from "@angular/core";
import { ClienteService } from "../services/cliente.service";
import { LibroService } from "../services/libro.service";
import { ReservaService } from "../services/reserva.service";
import { Cliente } from "../model/cliente";
import { Libro } from "../model/libro";
import { Reserva } from "../model/reserva";

@Service({ autoProvided: false })
export class ReservaWizardAiStore {
    private readonly clienteService = inject(ClienteService);
    private readonly libroService = inject(LibroService);
    private readonly reservaService = inject(ReservaService);

    readonly clientesResource = httpResource<Cliente[]>(() => this.clienteService.resourceUrl, { defaultValue: [] });
    readonly librosResource = httpResource<Libro[]>(() => this.libroService.resourceUrl, { defaultValue: [] });

    readonly $clientes = this.clientesResource.value;
    readonly $libros = this.librosResource.value;

    readonly $loading = computed(() => this.clientesResource.isLoading() || this.librosResource.isLoading());
    readonly $error = computed(() => this.clientesResource.error() || this.librosResource.error());

    private readonly _selectedLibro = signal<Libro | null>(null);
    readonly $selectedLibro = this._selectedLibro.asReadonly();

    selectLibro(libro: Libro) {
        this._selectedLibro.set(libro);
    }

    clearLibro() {
        this._selectedLibro.set(null);
    }

    save(reserva: Reserva) {
        return this.reservaService.save(reserva);
    }

    reload() {
        this.clientesResource.reload();
        this.librosResource.reload();
    }
}

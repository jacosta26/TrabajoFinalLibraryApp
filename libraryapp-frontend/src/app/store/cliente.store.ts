import { computed, inject, Service, signal } from "@angular/core";
import { ClienteService } from "../services/cliente.service";
import { httpResource } from "@angular/common/http";
import { Cliente } from "../model/cliente";
import { emptyPageResponse, PageResponse } from "../shared/models/page-response";

@Service({autoProvided: false})
export class ClienteStore {
    private readonly clienteService = inject(ClienteService);

    readonly $pageRequest = signal({ page: 0, size: 2});
    
    readonly clienteResource = httpResource<PageResponse<Cliente>>(
        () => ({
        url: `${this.clienteService.resourceUrl}/pageable`,
        params: {
            page: this.$pageRequest().page,
            size: this.$pageRequest().size,
        },
        }),
        {
        defaultValue: emptyPageResponse<Cliente>(),
        },
    );

    readonly $clientes = computed(() => this.clienteResource.value().content);

    readonly $totalElements = computed(() => this.clienteResource.value().page.totalElements);

    readonly $loading = this.clienteResource.isLoading;

    readonly $error = this.clienteResource.error;
    
    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }

    reload() {
        this.clienteResource.reload();
    }
}

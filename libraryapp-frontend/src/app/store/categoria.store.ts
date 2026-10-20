import { computed, inject, Service, signal } from "@angular/core";
import { CategoriaService } from "../services/categoria.service";
import { httpResource } from "@angular/common/http";
import { Categoria } from "../model/categoria";
import { emptyPageResponse, PageResponse } from "../shared/models/page-response";

@Service({autoProvided: false})
export class CategoriaStore {
    private readonly categoriaService = inject(CategoriaService);

    readonly $pageRequest = signal({ page: 0, size: 2});

    //readonly categoriaResource = httpResource<Categoria[]>(() => this.categoriaService.resourceUrl, {defaultValue: []});

    readonly categoriaResource = httpResource<PageResponse<Categoria>>(
        () => ({
            url: `${this.categoriaService.resourceUrl}/pageable`,
            params: {
                page: this.$pageRequest().page,
                size: this.$pageRequest().size,
            },
            }),
            {
            defaultValue: emptyPageResponse<Categoria>(),
        },
    );

    readonly $categorias = computed(() => this.categoriaResource.value().content);

    readonly $totalElements = computed(() => this.categoriaResource.value().page.totalElements);

    readonly $loading = this.categoriaResource.isLoading;

    readonly $error = this.categoriaResource.error;

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }

    reload() {
        this.categoriaResource.reload();
    }
}
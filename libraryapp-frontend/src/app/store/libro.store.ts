import { httpResource } from "@angular/common/http";
import { computed, inject, Service, signal } from "@angular/core";
import { LibroService } from "../services/libro.service";
import { Libro } from "../model/libro";
import { emptyPageResponse, PageResponse } from "../shared/models/page-response";

@Service({autoProvided: false})
export class LibroStore {
    private readonly libroService = inject(LibroService);

    readonly $pageRequest = signal({ page: 0, size: 2});
    
    readonly librosResource = httpResource<PageResponse<Libro>>(
        () => ({
                url: `${this.libroService.resourceUrl}/pageable`,
                params: {
                    page: this.$pageRequest().page,
                    size: this.$pageRequest().size,
                },
                }),
                {
                defaultValue: emptyPageResponse<Libro>(),
        },
    );
    
    readonly $libros = computed(() => this.librosResource.value().content);

    readonly $totalElements = computed(() => this.librosResource.value().page.totalElements);

    readonly $loading = this.librosResource.isLoading;

    readonly $error = this.librosResource.error;

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }
    
    reload() {
        this.librosResource.reload();
    }
}
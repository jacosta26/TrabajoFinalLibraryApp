import { inject, Service } from "@angular/core";
import { CategoriaService } from "../services/categoria.service";
import { httpResource } from "@angular/common/http";
import { Categoria } from "../model/categoria";

@Service({ autoProvided: false })
export class LibroDialogStore {
    private readonly categoriaService = inject(CategoriaService);

    readonly categoriasResource = httpResource<Categoria[]>(() => this.categoriaService.resourceUrl, { defaultValue: [] });

    readonly $categorias = this.categoriasResource.value;
    readonly $loading = this.categoriasResource.isLoading;
    readonly $error = this.categoriasResource.error;

    reload(){
        this.categoriasResource.reload();
    }
}
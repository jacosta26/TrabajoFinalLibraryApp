import { computed, inject, Service, signal } from "@angular/core";
import { CategoriaService } from "../services/categoria.service";
import { httpResource } from "@angular/common/http";
import { Categoria } from "../model/categoria";

@Service({ autoProvided: false })
export class CategoriaEditStore {

    private readonly categoriaService = inject(CategoriaService);
    readonly $id = signal<number | null>(null);

    private readonly $categoriaRequest = computed( ()=> {
        const id = this.$id();
        return id ? `${this.categoriaService.resourceUrl}/${id}` : null;
    });

    readonly categoriaResource = httpResource<Categoria>(() => this.$categoriaRequest());

    setId(id: number){
        this.$id.set(id);
    }
}
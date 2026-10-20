import { Service } from '@angular/core';
import { Categoria } from '../model/categoria';
import { GenericService } from './generic.service';
import { environment } from '../../environments/environment.development';

@Service()
export class CategoriaService extends GenericService<Categoria> {
    protected override url: string = `${environment.HOST}/v1/categories`;

    listPageable(page: number, size: number) {
        return this.http.get<Categoria[]>(`${this.url}/pageable?page=${page}&size=${size}`);
    }
}

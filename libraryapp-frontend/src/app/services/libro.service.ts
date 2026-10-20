import { Service } from '@angular/core';
import { Libro } from '../model/libro';
import { GenericService } from './generic.service';
import { environment } from '../../environments/environment.development';

@Service()
export class LibroService extends GenericService<Libro>{
    protected override url: string = `${environment.HOST}/v1/books`;

    listPageable(page: number, size: number) {
        return this.http.get<Libro[]>(`${this.url}/pageable?page=${page}&size=${size}`);
    }
}

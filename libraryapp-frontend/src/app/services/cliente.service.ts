import { Service } from '@angular/core';
import { GenericService } from './generic.service';
import { Cliente } from '../model/cliente';
import { environment } from '../../environments/environment.development';

@Service()
export class ClienteService extends GenericService<Cliente>{
    protected override url: string = `${environment.HOST}/v1/clients`;

    listPageable(page: number, size: number) {
        return this.http.get<Cliente[]>(`${this.url}/pageable?page=${page}&size=${size}`);
    }
}

import { HttpParams } from '@angular/common/http';
import { Service } from '@angular/core';
import { FilterReservaDTO } from '../model/filter-reserva-dto';
import { Reserva } from '../model/reserva';
import { GenericService } from './generic.service';
import { environment } from '../../environments/environment.development';

@Service()
export class ReservaService extends GenericService<Reserva>{
    protected override url: string = `${environment.HOST}/v1/reservations`;

    searchByOthers(filter: FilterReservaDTO) {
        return this.http.post<Reserva[]>(`${this.url}/search/others`, filter);
    }

    searchDates(date1: string, date2: string) {
        return this.http.get<Reserva[]>(`${this.url}/search/dates`, {
            params: new HttpParams().set('date1', date1).set('date2', date2)
        });
    }
}

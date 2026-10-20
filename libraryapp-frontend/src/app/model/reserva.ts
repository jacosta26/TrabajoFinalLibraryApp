import { Cliente } from './cliente';
import { DetalleReserva } from './detalle-reserva';

export class Reserva {
    idReserva: number;
    fechaReserva: string;
    cliente: Cliente;
    detalles: DetalleReserva[];
}

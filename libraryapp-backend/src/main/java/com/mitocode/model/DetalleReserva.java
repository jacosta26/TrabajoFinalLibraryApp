package com.mitocode.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class DetalleReserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idDetalleReserva;

    @ManyToOne
    @JoinColumn(name = "id_reserva", nullable = false, foreignKey = @ForeignKey(name = "fk_detail_reserva"))
    private Reserva reserva;

    @ManyToOne
    @JoinColumn(name = "id_libro", nullable = false, foreignKey = @ForeignKey(name = "fk_detail_reserva_libro"))
    private Libro libro;
}
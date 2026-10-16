package com.mitocode.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DetalleReservaDTO {
    private Integer idDetalleReserva;
    @JsonBackReference
    private ReservaDTO reserva;
    @NotNull
    private LibroDTO libro;
}

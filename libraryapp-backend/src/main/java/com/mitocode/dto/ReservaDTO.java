package com.mitocode.dto;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservaDTO {
    private Integer idReserva;
    @NotNull
    private LocalDateTime fechaReserva;
    @NotNull
    private ClienteDTO cliente;
    @NotNull
    @JsonManagedReference
    private List<DetalleReservaDTO> detalles;

}

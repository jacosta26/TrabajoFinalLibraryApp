package com.mitocode.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaDTO {
    private Integer idCategoria;
    @NotNull
    @Size(min = 5, max = 70, message = "{categoria.name.size}")
    private String nombreCategoria;
    @NotNull
    @Size(min = 15, max = 200, message = "{categoria.description.size}")
    private String descripcionCategoria;
    @NotNull
    @Size(min = 5, max = 20, message = "{categoria.state.size}")
    private String estadoCategoria;
}

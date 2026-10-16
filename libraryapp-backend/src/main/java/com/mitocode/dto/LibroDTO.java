package com.mitocode.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LibroDTO {
    private Integer idLibro;
    @NotNull
    @Size(min = 5, max = 150, message = "{libro.title.size}")
    private String title;
    @NotNull
    @Size(min = 5, max = 80, message = "{libro.autor.size}")
    private String nameAuthor;
    @NotNull
    @Size(min = 10, max = 13, message = "{libro.isbn.size}")
    private String isbn;
    @NotNull
    private Boolean disponible;
    @NotNull
    private Integer idCategoria;

}

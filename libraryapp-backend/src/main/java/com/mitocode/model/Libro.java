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
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idLibro;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 80)
    private String autor;

    @Column(nullable = false, length = 20)
    private String isbn;

    @Column(nullable = false)
    private Boolean disponible;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false, foreignKey = @ForeignKey(name = "fk_libro_categoria"))
    private Categoria categoria;
}
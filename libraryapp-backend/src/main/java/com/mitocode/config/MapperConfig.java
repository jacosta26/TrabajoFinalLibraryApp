package com.mitocode.config;

import com.mitocode.dto.DetalleReservaDTO;
import com.mitocode.dto.LibroDTO;
import com.mitocode.model.DetalleReserva;
import com.mitocode.model.Libro;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {
    @Bean
    public ModelMapper defaultMapper() {
        return new ModelMapper();
    }

    @Bean
    public ModelMapper libroMapper() {
        ModelMapper mapper = new ModelMapper();
        //ESCRITURA POST PUT
        mapper.createTypeMap(LibroDTO.class, Libro.class)
                .addMapping(LibroDTO::getTitle, Libro::setTitulo)
                .addMapping(LibroDTO::getNameAuthor, Libro::setAutor);
        //LECTURA GET
        mapper.createTypeMap(Libro.class, LibroDTO.class)
                .addMapping(Libro::getTitulo, LibroDTO::setTitle)
                .addMapping(Libro::getAutor, LibroDTO::setNameAuthor);

        return mapper;
    }

    @Bean
    public ModelMapper reservaMapper() {
        ModelMapper mapper = new ModelMapper();
        mapper.createTypeMap(DetalleReserva.class, DetalleReservaDTO.class)
                .addMapping(e -> e.getLibro().getTitulo(), (dest, v) -> dest.getLibro().setTitle((String) v))
                .addMapping(e -> e.getLibro().getAutor(), (dest, v) -> dest.getLibro().setNameAuthor((String) v));

        return mapper;
    }
}

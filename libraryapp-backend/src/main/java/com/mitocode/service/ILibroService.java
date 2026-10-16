package com.mitocode.service;

import com.mitocode.model.Libro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ILibroService extends ICRUD<Libro, Integer> {
    Page<Libro> listPage(Pageable pageable);
}

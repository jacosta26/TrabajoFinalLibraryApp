package com.mitocode.service;

import com.mitocode.model.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICategoriaService extends ICRUD<Categoria, Integer> {
    Page<Categoria> listPage(Pageable pageable);
}

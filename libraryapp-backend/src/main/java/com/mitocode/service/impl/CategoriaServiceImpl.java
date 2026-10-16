package com.mitocode.service.impl;

import com.mitocode.model.Categoria;
import com.mitocode.repository.ICategoriaRepo;
import com.mitocode.repository.IGenericRepo;
import com.mitocode.service.ICategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl extends CRUDImpl<Categoria, Integer> implements ICategoriaService {
    private final ICategoriaRepo repo;

    @Override
    protected IGenericRepo<Categoria, Integer> getRepo() {
        return repo;
    }

    @Override
    public Page<Categoria> listPage(Pageable pageable) {
        return repo.findAll(pageable);
    }
}

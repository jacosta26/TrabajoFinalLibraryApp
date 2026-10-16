package com.mitocode.service.impl;

import com.mitocode.model.Libro;
import com.mitocode.repository.IGenericRepo;
import com.mitocode.repository.ILibroRepo;
import com.mitocode.service.ILibroService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LibroServiceImpl extends CRUDImpl<Libro, Integer> implements ILibroService {
    private final ILibroRepo repo;

    @Override
    protected IGenericRepo<Libro, Integer> getRepo() {
        return repo;
    }

    @Override
    public Page<Libro> listPage(Pageable pageable) {
        return repo.findAll(pageable);
    }
}

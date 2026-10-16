package com.mitocode.service.impl;

import com.mitocode.model.Cliente;
import com.mitocode.repository.IClienteRepo;
import com.mitocode.repository.IGenericRepo;
import com.mitocode.service.IClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl extends CRUDImpl<Cliente, Integer> implements IClienteService {
    private final IClienteRepo repo;

    @Override
    protected IGenericRepo<Cliente, Integer> getRepo() {
        return repo;
    }

    @Override
    public Page<Cliente> listPage(Pageable pageable) {
        return repo.findAll(pageable);
    }
}

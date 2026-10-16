package com.mitocode.service;

import com.mitocode.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IClienteService extends ICRUD<Cliente, Integer> {
    Page<Cliente> listPage(Pageable pageable);
}

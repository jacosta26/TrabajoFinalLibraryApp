package com.mitocode.service.impl;

import com.mitocode.model.Reserva;
import com.mitocode.repository.IGenericRepo;
import com.mitocode.repository.IReservaRepo;
import com.mitocode.service.IReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaServiceImpl extends CRUDImpl<Reserva, Integer> implements IReservaService {
    private final IReservaRepo repo;

    @Override
    protected IGenericRepo<Reserva, Integer> getRepo() {
        return repo;
    }

    @Override
    public List<Reserva> search(String dni, String fullname) {
        return repo.search(dni, fullname);
    }

    @Override
    public List<Reserva> searchByDates(LocalDateTime date1, LocalDateTime date2) {
        return repo.searchByDates(date1, date2);
    }

    @Override
    public Page<Reserva> listPage(Pageable pageable) {
        return repo.findAll(pageable);
    }
}

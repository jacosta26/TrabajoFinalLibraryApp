package com.mitocode.service;

import com.mitocode.model.Reserva;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface IReservaService extends ICRUD<Reserva, Integer> {

    List<Reserva> search(String dni, String fullname);

    List<Reserva> searchByDates(LocalDateTime date1, LocalDateTime date2);

    Page<Reserva> listPage(Pageable pageable);
}

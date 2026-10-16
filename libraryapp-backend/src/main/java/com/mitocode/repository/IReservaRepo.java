package com.mitocode.repository;

import com.mitocode.model.Reserva;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface IReservaRepo extends IGenericRepo<Reserva, Integer> {

    @Query("FROM Reserva c WHERE c.cliente.cedula = :cedula OR LOWER(c.cliente.nombres) LIKE %:fullname% OR LOWER(c.cliente.apellidos) LIKE %:fullname%")
    List<Reserva> search(@Param("cedula") String dni, @Param("fullname") String fullname);

    @Query("FROM Reserva c WHERE c.fechaReserva BETWEEN :date1 AND :date2")
    List<Reserva> searchByDates(@Param("date1") LocalDateTime date1, @Param("date2") LocalDateTime date2);
}

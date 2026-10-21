package com.mitocode.controller;

import com.mitocode.dto.ReservaDTO;
import com.mitocode.model.Reserva;
import com.mitocode.service.IReservaService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("v1/reservations")
@AllArgsConstructor
public class ReservaController {
    private IReservaService service;
    private ModelMapper reservaMapper;

    public record FilterReservaDTO(String cedula, String fullname) {
    }

    @GetMapping
    public ResponseEntity<List<ReservaDTO>> findAll() {
        List<Reserva> list = service.finAll();
        List<ReservaDTO> listDto = list.stream().map(this::convertToDto).toList();
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> findById(@PathVariable Integer id) {
        Reserva obj = service.finById(id);
        return ResponseEntity.ok(convertToDto(obj));
    }

    @PostMapping
    public ResponseEntity<Void> save(@Valid @RequestBody ReservaDTO dto) {
        Reserva obj = convertToEntity(dto);
        if (obj.getDetalles() != null) {
            obj.getDetalles().forEach(d -> d.setReserva(obj));
        }
        Reserva saved = service.save(obj);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(saved.getIdReserva()).toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservaDTO> update(@PathVariable Integer id, @Valid @RequestBody ReservaDTO dto) throws Exception {
        Reserva obj = convertToEntity(dto);
        if (obj.getDetalles() != null) {
            obj.getDetalles().forEach(d -> d.setReserva(obj));
        }
        Reserva updated = service.update(id, obj);
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search/others")
    public ResponseEntity<List<ReservaDTO>> searchByOthers(@RequestBody FilterReservaDTO filter) {
        String cedula = (Objects.isNull(filter.cedula()) ||  filter.cedula().isEmpty()) ? null : filter.cedula();
        String fullName = (Objects.isNull(filter.fullname()) ||  filter.fullname().isEmpty()) ? null : filter.fullname();
        List<Reserva> list = service.search(cedula, fullName);
        List<ReservaDTO> listDto = list.stream().map(this::convertToDto).toList();
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/search/dates")
    public ResponseEntity<ReservaDTO[]> searchByDates(@RequestParam String date1, @RequestParam String date2) {
        LocalDateTime from = LocalDateTime.parse(date1);
        LocalDateTime to = LocalDateTime.parse(date2);
        List<Reserva> list = service.searchByDates(from, to);
        ReservaDTO[] listDto = list.stream().map(this::convertToDto).toArray(ReservaDTO[]::new);
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/pageable")
    public ResponseEntity<Page<ReservaDTO>> listPageable(Pageable pageable) {
        Page<ReservaDTO> page = service.listPage(pageable).map(this::convertToDto);
        return ResponseEntity.ok(page);
    }

    private Reserva convertToEntity(ReservaDTO dto) {
        return reservaMapper.map(dto, Reserva.class);
    }

    private ReservaDTO convertToDto(Reserva entity) {
        return reservaMapper.map(entity, ReservaDTO.class);
    }

}

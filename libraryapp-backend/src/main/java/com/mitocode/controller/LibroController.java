package com.mitocode.controller;


import com.mitocode.dto.LibroDTO;
import com.mitocode.model.Libro;
import com.mitocode.service.ILibroService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("v1/books")
@AllArgsConstructor
public class LibroController {
    private ILibroService service;
    private ModelMapper libroMapper;

    @GetMapping
    public ResponseEntity<List<LibroDTO>> findAll() {
        List<Libro> list = service.finAll();
        List<LibroDTO> listDto = list.stream().map(this::convertToDto).toList();
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibroDTO> findById(@PathVariable Integer id) {
        Libro obj = service.finById(id);
        return ResponseEntity.ok(convertToDto(obj));
    }

    @PostMapping
    public ResponseEntity<Void> save(@Valid @RequestBody LibroDTO dto) {
        Libro obj = service.save(convertToEntity(dto));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(obj.getIdLibro()).toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibroDTO> update(@PathVariable Integer id, @Valid @RequestBody LibroDTO dto) throws Exception {
        Libro obj = service.update(id, convertToEntity(dto));
        return ResponseEntity.ok(convertToDto(obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pageable")
    public ResponseEntity<Page<LibroDTO>> listPageable(Pageable pageable) {
        Page<LibroDTO> page = service.listPage(pageable).map(this::convertToDto);
        return ResponseEntity.ok(page);
    }

    private Libro convertToEntity(LibroDTO dto) {
        return libroMapper.map(dto, Libro.class);
    }

    private LibroDTO convertToDto(Libro entity) {
        return libroMapper.map(entity, LibroDTO.class);
    }

}

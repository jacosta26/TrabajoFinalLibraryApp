package com.mitocode.controller;

import com.mitocode.dto.CategoriaDTO;
import com.mitocode.model.Categoria;
import com.mitocode.service.ICategoriaService;
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
@RequestMapping("v1/categories")
@AllArgsConstructor
public class CategoriaController {
    private ICategoriaService service;
    private ModelMapper defaultMapper;

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> findAll() {
        List<Categoria> list = service.finAll();
        List<CategoriaDTO> listDto = list.stream().map(this::convertToDto).toList();
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDTO> findById(@PathVariable Integer id) {
        Categoria obj = service.finById(id);
        return ResponseEntity.ok(convertToDto(obj));
    }

    @PostMapping
    public ResponseEntity<Void> save(@Valid @RequestBody CategoriaDTO dto) {
        Categoria obj = service.save(convertToEntity(dto));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(obj.getIdCategoria()).toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDTO> update(@PathVariable Integer id, @Valid @RequestBody CategoriaDTO dto) throws Exception {
        Categoria obj = service.update(id, convertToEntity(dto));
        return ResponseEntity.ok(convertToDto(obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pageable")
    public ResponseEntity<Page<CategoriaDTO>> listPageable(Pageable pageable) {
        Page<CategoriaDTO> page = service.listPage(pageable).map(this::convertToDto);
        return ResponseEntity.ok(page);
    }

    private Categoria convertToEntity(CategoriaDTO dto) {
        return defaultMapper.map(dto, Categoria.class);
    }

    private CategoriaDTO convertToDto(Categoria entity) {
        return defaultMapper.map(entity, CategoriaDTO.class);
    }
}

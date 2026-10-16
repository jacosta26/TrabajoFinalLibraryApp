package com.mitocode.controller;

import com.mitocode.dto.ClienteDTO;
import com.mitocode.model.Cliente;
import com.mitocode.service.IClienteService;
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
@RequestMapping("v1/clients")
@AllArgsConstructor
public class ClienteController {
    private IClienteService service;
    private ModelMapper defaultMapper;

    @GetMapping
    public ResponseEntity<List<ClienteDTO>> findAll() {
        List<Cliente> list = service.finAll();
        List<ClienteDTO> listDto = list.stream().map(this::convertToDto).toList();
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteDTO> findById(@PathVariable Integer id) {
        Cliente obj = service.finById(id);
        return ResponseEntity.ok(convertToDto(obj));
    }

    @PostMapping
    public ResponseEntity<Void> save(@Valid @RequestBody ClienteDTO dto) {
        Cliente obj = service.save(convertToEntity(dto));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(obj.getIdCliente()).toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> update(@PathVariable Integer id, @Valid @RequestBody ClienteDTO dto) throws Exception {
        Cliente obj = service.update(id, convertToEntity(dto));
        return ResponseEntity.ok(convertToDto(obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pageable")
    public ResponseEntity<Page<ClienteDTO>> listPageable(Pageable  pageable) {
        Page<ClienteDTO> page = service.listPage(pageable).map(this::convertToDto);
        return ResponseEntity.ok(page);
    }

    private Cliente convertToEntity(ClienteDTO dto) {
        return defaultMapper.map(dto, Cliente.class);
    }

    private ClienteDTO convertToDto(Cliente entity) {
        return defaultMapper.map(entity, ClienteDTO.class);
    }
}

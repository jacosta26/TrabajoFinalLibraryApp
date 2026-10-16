package com.mitocode.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClienteDTO {
    private Integer idCliente;
    @NotBlank
    @Size(min = 3, max = 80, message = "{cliente.nombres.size}")
    private String nombres;
    @NotBlank
    @Size(min = 2, max = 80, message = "{cliente.apellidos.size}")
    private String apellidos;
    @NotBlank
    @Size(min = 5, max = 20, message = "{cliente.cedula.size}")
    private String cedula;
    @NotBlank
    @Email
    @Size(min = 11, max = 60, message = "{cliente.email.size}")
    private String email;
}

package com.mail.assistant.user.dto;


import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class UserEditRequest {
    @Size(max = 150)
    private String name; // opcional


    @Size(max = 10000)
    private String info; // opcional
}
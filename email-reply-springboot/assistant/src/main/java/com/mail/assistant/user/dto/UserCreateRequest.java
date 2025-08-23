package com.mail.assistant.user.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class UserCreateRequest {
    @NotBlank
    @Size(max = 150)
    private String name;


    @Size(max = 10000)
    private String info;
}
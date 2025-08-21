package com.mail.assistant.model;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;

@Data
@JsonPropertyOrder({"content", "operation"})
public class EmailRequest {
    private String content;
    private String tone;
}

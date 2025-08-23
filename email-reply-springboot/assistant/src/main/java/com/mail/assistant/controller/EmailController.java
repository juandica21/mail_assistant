package com.mail.assistant.controller;

import com.mail.assistant.model.EmailRequest;
import com.mail.assistant.service.EmailServiceES;
import com.mail.assistant.service.EmailServiceEN;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins="*")
public class EmailController {

    private final EmailServiceEN emailServiceEN;
    private final EmailServiceES emailServiceES;

    @PostMapping("/generateES")
    public ResponseEntity<String> generateEmailES(@RequestBody EmailRequest emailRequest){
        String response = emailServiceES.generateReplay(emailRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generateEN")
    public ResponseEntity<String> generateEmailEN(@RequestBody EmailRequest emailRequest){
        String response = emailServiceEN.generateReplay(emailRequest);
        return ResponseEntity.ok(response);
    }

}

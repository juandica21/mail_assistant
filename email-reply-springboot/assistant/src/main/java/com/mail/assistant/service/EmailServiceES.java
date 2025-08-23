package com.mail.assistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mail.assistant.model.EmailRequest;
import com.mail.assistant.model.GeminiResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailServiceES {

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public EmailServiceES(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateReplay (EmailRequest emailRequest){

        String prompt = buildPrompt(emailRequest);

        Map<String,Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)}
                        )}
        );

        String response = webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractTextFromResponse(response);

    }

    private String extractTextFromResponse(String response) {
        try{
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            if(geminiResponse.getCandidates() != null && !geminiResponse.getCandidates().isEmpty()){
                GeminiResponse.Candidate firstCandidate = geminiResponse.getCandidates().get(0);
                if (firstCandidate != null && firstCandidate.getContent().getParts() != null && !firstCandidate.getContent().getParts().isEmpty()) {
                    return firstCandidate.getContent().getParts().get(0).getText();
                }
            }
        } catch(Exception e){
            return "Error Parsing" + e.getMessage();
        }
        return "No Content found in response";
    }

    private String buildPrompt(EmailRequest emailRequest) {

        if (emailRequest.getTone() == null || emailRequest.getContent() == null) {
            throw new IllegalArgumentException("Content y tone no pueden ser nulos");
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("Genera una respuesta para el siguiente mail recibido. No generes una línea de asunto, por favor. En español!!!");

        if (emailRequest.getUserInfo() != null && !emailRequest.getUserInfo().isEmpty()) {
            prompt.append("\nContexto adicional del usuario: ").append(emailRequest.getUserInfo());
        }

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("\nUsa un tono: ").append(emailRequest.getTone());
        }

        prompt.append("\nMail original:\n").append(emailRequest.getContent());

        return prompt.toString();
    }

}

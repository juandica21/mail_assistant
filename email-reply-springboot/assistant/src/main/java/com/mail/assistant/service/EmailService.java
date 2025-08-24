package com.mail.assistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mail.assistant.model.EmailRequest;
import com.mail.assistant.model.GeminiResponse;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailService {

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public EmailService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateReplay(EmailRequest emailRequest) {

        // 1. Detect language first
        String detectedLang = detectLanguage(emailRequest.getContent());
        System.out.println("Detected Language: " + detectedLang);

        // 2. Build prompt using detected language
        String prompt = buildPrompt(emailRequest, detectedLang);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
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

    private String detectLanguage(String emailContent) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[]{
                            Map.of("parts", new Object[]{
                                    Map.of("text",
                                            "Detect the language of the following email and respond only with the language name (e.g., English, Spanish, Catalan):\n\n"
                                                    + emailContent)
                            })
                    }
            );

            String response = webClient.post()
                    .uri(geminiApiUrl + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);

            if (geminiResponse.getCandidates() != null && !geminiResponse.getCandidates().isEmpty()) {
                return geminiResponse.getCandidates()
                        .get(0)
                        .getContent()
                        .getParts()
                        .get(0)
                        .getText()
                        .trim();
            }

        } catch (Exception e) {
            System.err.println("Error detecting language: " + e.getMessage());
        }
        return "Unknown";
    }

    private String buildPrompt(EmailRequest emailRequest, String detectedLang) {

        if (emailRequest.getTone() == null || emailRequest.getContent() == null) {
            throw new IllegalArgumentException("Content y tone can not be null");
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a reply to the following email. ")
                .append("The reply MUST be written strictly in ")
                .append(detectedLang)
                .append(". Do not translate or mix languages.\n\n")
                .append("Ensure the tone is polite and context-appropriate.\n")
                .append("Do NOT create a subject line.\n");

        if (emailRequest.getUserInfo() != null && !emailRequest.getUserInfo().isEmpty()) {
            prompt.append("Additional info about the user: ")
                    .append(emailRequest.getUserInfo())
                    .append("\n\nEXTRA: Not all the info es necessary for every reply, use only the crutial information about this user.")
                    .append("\n");
        }

        if (!emailRequest.getTone().isEmpty()) {
            prompt.append("Tone: ").append(emailRequest.getTone()).append("\n");
        }

        prompt.append("\nOriginal email:\n")
                .append(emailRequest.getContent());

        return prompt.toString();
    }

}

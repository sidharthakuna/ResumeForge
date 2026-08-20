package com.resumebuilder.ai.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai.config.AiProperties;
import com.resumebuilder.common.exception.AiGenerationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiLlmService implements LlmService {

    private static final Logger log = LoggerFactory.getLogger(GeminiLlmService.class);

    private final RestClient restClient;
    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    public GeminiLlmService(RestClient geminiRestClient, AiProperties aiProperties, ObjectMapper objectMapper) {
        this.restClient = geminiRestClient;
        this.aiProperties = aiProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean isAvailable() {
        return aiProperties.isEnabled()
                && aiProperties.getGemini().getApiKey() != null
                && !aiProperties.getGemini().getApiKey().isBlank();
    }

    @Override
    public AiGenerationResponse generate(AiGenerationRequest request) {
        if (!isAvailable()) {
            throw new AiGenerationException("AI service is not configured or disabled");
        }

        String model = aiProperties.getGemini().getModel();
        String apiKey = aiProperties.getGemini().getApiKey();
        String path = "/v1beta/models/" + model + ":generateContent";

        Map<String, Object> payload = new HashMap<>();

        if (request.systemInstruction() != null && !request.systemInstruction().isBlank()) {
            payload.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", request.systemInstruction()))
            ));
        }

        List<Map<String, Object>> contents = new ArrayList<>();
        contents.add(Map.of(
                "parts", List.of(Map.of("text", request.prompt() != null ? request.prompt() : ""))
        ));
        payload.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        if (request.temperature() != null) {
            generationConfig.put("temperature", request.temperature());
        }
        if (request.maxOutputTokens() != null) {
            generationConfig.put("maxOutputTokens", request.maxOutputTokens());
        }
        if (request.responseMimeType() != null && !request.responseMimeType().isBlank()) {
            generationConfig.put("responseMimeType", request.responseMimeType());
        }
        if (!generationConfig.isEmpty()) {
            payload.put("generationConfig", generationConfig);
        }

        try {
            String responseBody = restClient.post()
                    .uri(path)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                throw new AiGenerationException("Empty response received from Gemini");
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isMissingNode() || !candidates.isArray() || candidates.isEmpty()) {
                JsonNode errorNode = root.path("error");
                if (!errorNode.isMissingNode()) {
                    String errorMsg = errorNode.path("message").asText("Unknown Gemini error");
                    throw new AiGenerationException("Gemini error: " + errorMsg);
                }
                throw new AiGenerationException("No candidates returned from Gemini");
            }

            JsonNode firstCandidate = candidates.get(0);
            String finishReason = firstCandidate.path("finishReason").asText("STOP");
            JsonNode parts = firstCandidate.path("content").path("parts");

            StringBuilder textBuilder = new StringBuilder();
            if (parts.isArray()) {
                for (JsonNode part : parts) {
                    if (part.has("text")) {
                        textBuilder.append(part.get("text").asText());
                    }
                }
            }

            String generatedText = cleanJson(textBuilder.toString());
            int promptTokens = root.path("usageMetadata").path("promptTokenCount").asInt(0);
            int candidateTokens = root.path("usageMetadata").path("candidatesTokenCount").asInt(0);

            return new AiGenerationResponse(generatedText, finishReason, promptTokens, candidateTokens);

        } catch (RestClientResponseException ex) {
            String responseBody = ex.getResponseBodyAsString();
            log.warn("Gemini HTTP error (status {}): {}", ex.getStatusCode(), responseBody != null && !responseBody.isBlank() ? responseBody : "[Empty response body]");
            throw new AiGenerationException("AI provider returned error status: " + ex.getStatusCode(), ex);
        } catch (AiGenerationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error calling Gemini API: {}", ex.getMessage(), ex);
            throw new AiGenerationException("Failed to generate content with AI provider", ex);
        }
    }

    private String cleanJson(String text) {
        if (text == null) return "{}";
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}

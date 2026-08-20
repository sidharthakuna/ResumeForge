package com.resumebuilder.ai.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai.config.AiProperties;
import com.resumebuilder.common.exception.AiGenerationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GeminiLlmServiceTest {

    private static final String TEST_API_KEY = "test-dummy-key-12345";
    private AiProperties aiProperties;
    private ObjectMapper objectMapper;
    private GeminiLlmService geminiLlmService;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        aiProperties = new AiProperties();
        aiProperties.setEnabled(true);
        aiProperties.getGemini().setApiKey(TEST_API_KEY);
        aiProperties.getGemini().setModel("gemini-1.5-flash");
        aiProperties.getGemini().setBaseUrl("https://generativelanguage.googleapis.com");

        objectMapper = new ObjectMapper();

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(aiProperties.getGemini().getBaseUrl());
        mockServer = MockRestServiceServer.bindTo(builder).build();
        RestClient restClient = builder.build();

        geminiLlmService = new GeminiLlmService(restClient, aiProperties, objectMapper);
    }

    @Test
    void testIsAvailable() {
        assertTrue(geminiLlmService.isAvailable());

        aiProperties.getGemini().setApiKey("");
        assertFalse(geminiLlmService.isAvailable());

        aiProperties.getGemini().setApiKey("key");
        aiProperties.setEnabled(false);
        assertFalse(geminiLlmService.isAvailable());
    }

    @Test
    void testGenerateSendsHeaderAndParsesResponse() {
        String mockResponseBody = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "{\\"summary\\": \\"Experienced Java Developer\\"}"
                          }
                        ]
                      },
                      "finishReason": "STOP"
                    }
                  ],
                  "usageMetadata": {
                    "promptTokenCount": 120,
                    "candidatesTokenCount": 45
                  }
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", TEST_API_KEY))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(mockResponseBody, MediaType.APPLICATION_JSON));

        AiGenerationRequest req = AiGenerationRequest.builder()
                .systemInstruction("You are a resume writer.")
                .prompt("Generate a summary.")
                .jsonResponse()
                .temperature(0.2)
                .build();

        AiGenerationResponse res = geminiLlmService.generate(req);

        mockServer.verify();
        assertNotNull(res);
        assertEquals("{\"summary\": \"Experienced Java Developer\"}", res.text());
        assertEquals("STOP", res.finishReason());
        assertEquals(120, res.promptTokens());
        assertEquals(45, res.candidateTokens());
    }

    @Test
    void testGenerateThrowsExceptionOnHttpError() {
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", TEST_API_KEY))
                .andRespond(withUnauthorizedRequest());

        AiGenerationRequest req = AiGenerationRequest.builder()
                .prompt("Hello")
                .build();

        AiGenerationException ex = assertThrows(AiGenerationException.class, () -> geminiLlmService.generate(req));
        assertTrue(ex.getMessage().contains("401"));
        mockServer.verify();
    }
}

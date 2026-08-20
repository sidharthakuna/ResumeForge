package com.resumebuilder.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai.dto.ParseMarkdownRequest;
import com.resumebuilder.auth.service.JwtService;
import com.resumebuilder.user.enums.Role;
import com.resumebuilder.user.entity.User;
import com.resumebuilder.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByEmail("aitestuser@example.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("aitestuser@example.com");
            u.setPassword("password123");
            u.setFullName("AI Test User");
            u.setRole(Role.USER);
            return userRepository.save(u);
        });

        jwtToken = jwtService.generateToken(testUser);
    }

    @Test
    void unauthenticatedRequestShouldFail() throws Exception {
        mockMvc.perform(post("/api/ai/parse-markdown")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ParseMarkdownRequest("# Test Project"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void parseMarkdownEndpointShouldWorkForAuthenticatedUser() throws Exception {
        ParseMarkdownRequest req = new ParseMarkdownRequest("""
                # E-Commerce App
                ## Technologies
                - Java 21
                - Spring Boot 3
                """);

        mockMvc.perform(post("/api/ai/parse-markdown")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.projectName").value("E-Commerce App"));
    }
}

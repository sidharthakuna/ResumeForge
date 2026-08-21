package com.resumebuilder.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.auth.dto.*;
import com.resumebuilder.auth.entity.EmailOtp;
import com.resumebuilder.auth.enums.OtpPurpose;
import com.resumebuilder.auth.repository.EmailOtpRepository;
import com.resumebuilder.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailOtpRepository emailOtpRepository;

    @BeforeEach
    void setUp() {
        emailOtpRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testRegisterAndLoginFlow() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("testuser@example.com", "SecurePassword123!", "Test User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("testuser@example.com"));

        // Verify registration OTP was created
        assertThat(emailOtpRepository.findAll()).isNotEmpty();

        LoginRequest loginReq = new LoginRequest("testuser@example.com", "SecurePassword123!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    void testSendAndVerifyOtp() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("verify@example.com", "SecurePassword123!", "Verify User");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        EmailOtp otp = emailOtpRepository.findAll().get(0);
        assertThat(otp.getOtpCode()).isNotNull();

        VerifyOtpRequest verifyReq = new VerifyOtpRequest("verify@example.com", otp.getOtpCode(), OtpPurpose.REGISTRATION);
        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.message").value("Email successfully verified"));

        assertThat(userRepository.findByEmail("verify@example.com").orElseThrow().isEmailVerified()).isTrue();
    }

    @Test
    void testForgotPasswordAndResetPasswordFlow() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("reset@example.com", "OldPassword123!", "Reset User");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        emailOtpRepository.deleteAll();

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest("reset@example.com");
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotReq)))
                .andExpect(status().isOk());

        EmailOtp resetOtp = emailOtpRepository.findAll().get(0);
        assertThat(resetOtp.getPurpose()).isEqualTo(OtpPurpose.PASSWORD_RESET);

        ResetPasswordRequest resetReq = new ResetPasswordRequest("reset@example.com", resetOtp.getOtpCode(), "NewSecretPassword123!");
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk());

        // Verify login with new password succeeds and old password fails
        LoginRequest oldLoginReq = new LoginRequest("reset@example.com", "OldPassword123!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldLoginReq)))
                .andExpect(status().isUnauthorized());

        LoginRequest newLoginReq = new LoginRequest("reset@example.com", "NewSecretPassword123!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLoginReq)))
                .andExpect(status().isOk());
    }
}
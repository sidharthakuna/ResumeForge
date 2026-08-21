package com.resumebuilder.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
        @NotBlank(message = "Google credential token is required")
        String credential
) {}

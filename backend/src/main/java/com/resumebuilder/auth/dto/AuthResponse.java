package com.resumebuilder.auth.dto;

public record AuthResponse(
        String token,
        String email,
        String fullName,
        String role
) {
}
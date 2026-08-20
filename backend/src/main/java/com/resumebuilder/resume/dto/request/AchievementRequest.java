package com.resumebuilder.resume.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AchievementRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be under 200 characters")
        String title,

        String description,

        @Size(max = 150, message = "Issuer must be under 150 characters")
        String issuer,

        LocalDate achievementDate
) {
}
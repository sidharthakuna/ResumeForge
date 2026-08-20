package com.resumebuilder.resume.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProjectRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be under 150 characters")
        String title,

        String description,

        @Size(max = 500, message = "GitHub URL must be under 500 characters")
        String githubUrl,

        @Size(max = 500, message = "Demo URL must be under 500 characters")
        String demoUrl,

        LocalDate startDate,

        LocalDate endDate,

        boolean currentlyBuilding
) {
}
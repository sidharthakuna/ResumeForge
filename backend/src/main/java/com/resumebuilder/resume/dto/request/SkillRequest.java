package com.resumebuilder.resume.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SkillRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be under 100 characters")
        String name
) {
}
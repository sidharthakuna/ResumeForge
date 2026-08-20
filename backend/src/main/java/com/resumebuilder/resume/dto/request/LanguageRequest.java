package com.resumebuilder.resume.dto.request;

import com.resumebuilder.resume.entity.ProficiencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LanguageRequest(
        @NotBlank(message = "Language name is required")
        @Size(max = 100, message = "Language name must be under 100 characters")
        String languageName,

        @NotNull(message = "Proficiency level is required")
        ProficiencyLevel proficiencyLevel
) {
}
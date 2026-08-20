package com.resumebuilder.resume.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ExperienceRequest(
        @NotBlank(message = "Company is required")
        @Size(max = 150, message = "Company must be under 150 characters")
        String company,

        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Job title must be under 150 characters")
        String jobTitle,

        String description,

        LocalDate startDate,

        LocalDate endDate,

        boolean currentlyWorking
) {
}
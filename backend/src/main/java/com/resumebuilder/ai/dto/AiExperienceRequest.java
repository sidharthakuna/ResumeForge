package com.resumebuilder.ai.dto;

import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AiExperienceRequest(
        UUID experienceId,

        @Size(max = 200, message = "Company name cannot exceed 200 characters")
        String company,

        @Size(max = 200, message = "Job title cannot exceed 200 characters")
        String jobTitle,

        @Size(max = 5000, message = "Current description cannot exceed 5000 characters")
        String currentDescription,

        @Size(max = 200, message = "Target job title cannot exceed 200 characters")
        String targetJobTitle,

        @Size(max = 10000, message = "Target job description cannot exceed 10000 characters")
        String targetJobDescription
) {}

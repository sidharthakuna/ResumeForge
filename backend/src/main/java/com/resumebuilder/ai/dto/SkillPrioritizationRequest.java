package com.resumebuilder.ai.dto;

import jakarta.validation.constraints.Size;

public record SkillPrioritizationRequest(
        @Size(max = 200, message = "Target job title cannot exceed 200 characters")
        String targetJobTitle,

        @Size(max = 10000, message = "Target job description cannot exceed 10000 characters")
        String targetJobDescription
) {}

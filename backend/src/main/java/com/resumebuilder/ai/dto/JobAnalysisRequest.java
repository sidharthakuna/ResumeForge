package com.resumebuilder.ai.dto;

import jakarta.validation.constraints.Size;

public record JobAnalysisRequest(
        @Size(max = 200, message = "Job title cannot exceed 200 characters")
        String targetJobTitle,

        @Size(max = 10000, message = "Job description cannot exceed 10000 characters")
        String targetJobDescription
) {}

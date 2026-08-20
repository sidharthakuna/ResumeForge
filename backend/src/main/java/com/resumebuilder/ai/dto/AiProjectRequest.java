package com.resumebuilder.ai.dto;

import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AiProjectRequest(
        UUID projectId,

        @Size(max = 200, message = "Project title cannot exceed 200 characters")
        String title,

        @Size(max = 5000, message = "Current description cannot exceed 5000 characters")
        String currentDescription,

        @Size(max = 25000, message = "README content cannot exceed 25000 characters")
        String readmeContent,

        @Size(max = 200, message = "Target job title cannot exceed 200 characters")
        String targetJobTitle,

        @Size(max = 10000, message = "Target job description cannot exceed 10000 characters")
        String targetJobDescription
) {}

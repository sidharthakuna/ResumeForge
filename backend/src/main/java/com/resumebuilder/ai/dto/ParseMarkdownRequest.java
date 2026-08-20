package com.resumebuilder.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParseMarkdownRequest(
        @NotBlank(message = "Markdown content cannot be blank")
        @Size(max = 50000, message = "Markdown content cannot exceed 50000 characters")
        String markdownContent
) {}

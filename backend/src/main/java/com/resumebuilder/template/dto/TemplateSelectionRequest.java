package com.resumebuilder.template.dto;

import com.resumebuilder.template.ResumeTemplate;
import jakarta.validation.constraints.NotNull;

public record TemplateSelectionRequest(
        @NotNull(message = "Template is required")
        ResumeTemplate template
) {
}
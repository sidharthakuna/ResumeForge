package com.resumebuilder.generation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GenerateFromHtmlRequest(
        @NotBlank(message = "HTML content is required")
        String html,

        // Optional. Free-text label the frontend can supply to identify
        // which of ITS OWN templates rendered this HTML (e.g.
        // "ats-safe-v1"). Not validated against any fixed set on the
        // backend, since the backend doesn't own or know the frontend's
        // template catalog. Null is fine -- stored as-is in
        // GeneratedResume.frontendTemplateName.
        @Size(max = 100, message = "Template name must be under 100 characters")
        String templateName
) {
}
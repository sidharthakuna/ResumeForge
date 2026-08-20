package com.resumebuilder.generation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record GeneratedResumeSummary(
        UUID id,
        String downloadUrl,
        LocalDateTime generatedAt,
        String frontendTemplateName
) {
}

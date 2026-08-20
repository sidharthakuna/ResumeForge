package com.resumebuilder.ai.dto;

import java.util.List;
import java.util.UUID;

public record AiProjectResponse(
        UUID projectId,
        String title,
        List<String> bullets,
        List<String> extractedTech,
        List<String> matchedKeywords
) {}

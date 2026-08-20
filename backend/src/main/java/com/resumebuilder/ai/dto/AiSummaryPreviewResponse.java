package com.resumebuilder.ai.dto;

import java.util.List;

public record AiSummaryPreviewResponse(
        String summary,
        String jobTitle,
        List<String> matchedSkills,
        List<String> missingSkills,
        String tailoredFocus
) {}

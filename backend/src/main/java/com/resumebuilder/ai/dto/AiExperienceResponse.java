package com.resumebuilder.ai.dto;

import java.util.List;
import java.util.UUID;

public record AiExperienceResponse(
        UUID experienceId,
        String company,
        String jobTitle,
        List<String> bullets,
        List<String> matchedKeywords
) {}

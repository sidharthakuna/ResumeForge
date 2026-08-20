package com.resumebuilder.ai.dto;

import java.util.List;

public record SkillPrioritizationResponse(
        List<String> prioritizedSkills,
        int matchedCount,
        List<String> missingSuggestions
) {}

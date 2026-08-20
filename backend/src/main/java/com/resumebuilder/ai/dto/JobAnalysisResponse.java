package com.resumebuilder.ai.dto;

import java.util.List;

public record JobAnalysisResponse(
        String jobTitle,
        List<String> requiredSkills,
        List<String> preferredSkills,
        List<String> responsibilities,
        List<String> keywords,
        List<SkillMatchItem> skillMatches,
        List<String> missingSkills,
        int matchScore
) {}

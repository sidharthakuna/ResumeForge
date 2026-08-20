package com.resumebuilder.ai.dto;

public record SkillMatchItem(
        String skill,
        MatchClassification classification,
        String candidateContext
) {}

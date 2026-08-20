package com.resumebuilder.resume.dto.response;

import com.resumebuilder.resume.entity.ProficiencyLevel;

import java.util.UUID;

public record LanguageResponse(
        UUID id,
        String languageName,
        ProficiencyLevel proficiencyLevel
) {
}
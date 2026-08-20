package com.resumebuilder.resume.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record AchievementResponse(
        UUID id,
        String title,
        String description,
        String issuer,
        LocalDate achievementDate
) {
}
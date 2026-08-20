package com.resumebuilder.resume.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String title,
        String description,
        String githubUrl,
        String demoUrl,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentlyBuilding
) {
}
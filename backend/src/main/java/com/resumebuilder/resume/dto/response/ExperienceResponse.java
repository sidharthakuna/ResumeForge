package com.resumebuilder.resume.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record ExperienceResponse(
        UUID id,
        String company,
        String jobTitle,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentlyWorking
) {
}
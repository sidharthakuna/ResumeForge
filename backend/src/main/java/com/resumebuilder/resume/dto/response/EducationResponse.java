package com.resumebuilder.resume.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record EducationResponse(
        UUID id,
        String institution,
        String degree,
        String fieldOfStudy,
        String grade,
        LocalDate startDate,
        LocalDate endDate
) {
}
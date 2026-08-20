package com.resumebuilder.resume.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EducationRequest(
        @NotBlank(message = "Institution is required")
        @Size(max = 150, message = "Institution must be under 150 characters")
        String institution,

        @NotBlank(message = "Degree is required")
        @Size(max = 100, message = "Degree must be under 100 characters")
        String degree,

        @Size(max = 100, message = "Field of study must be under 100 characters")
        String fieldOfStudy,

        @Size(max = 100, message = "Grade/CGPA/Percentage must be under 100 characters")
        String grade,

        LocalDate startDate,

        LocalDate endDate
) {
}
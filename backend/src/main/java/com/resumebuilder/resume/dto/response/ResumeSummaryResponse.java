package com.resumebuilder.resume.dto.response;

import com.resumebuilder.common.enums.ResumeStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ResumeSummaryResponse(
        UUID id,
        String title,
        ResumeStatus status,
        LocalDateTime updatedAt
) {
}
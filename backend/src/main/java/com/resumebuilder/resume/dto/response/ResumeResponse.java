package com.resumebuilder.resume.dto.response;

import com.resumebuilder.common.enums.ResumeStatus;
import java.util.UUID;

public record ResumeResponse(UUID id, String title, ResumeStatus status, String summary, String declaration, String strengths) {
}
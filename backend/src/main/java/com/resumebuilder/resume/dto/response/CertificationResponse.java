package com.resumebuilder.resume.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record CertificationResponse(
        UUID id,
        String name,
        String issuingOrganization,
        LocalDate issueDate,
        LocalDate expirationDate,
        String credentialId,
        String credentialUrl
) {
}
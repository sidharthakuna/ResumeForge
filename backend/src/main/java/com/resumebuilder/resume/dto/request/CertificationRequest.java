package com.resumebuilder.resume.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CertificationRequest(
        @NotBlank(message = "Certification name is required")
        @Size(max = 150, message = "Certification name must be under 150 characters")
        String name,

        @NotBlank(message = "Issuing organization is required")
        @Size(max = 150, message = "Issuing organization must be under 150 characters")
        String issuingOrganization,

        LocalDate issueDate,

        LocalDate expirationDate,

        @Size(max = 100, message = "Credential ID must be under 100 characters")
        String credentialId,

        @Size(max = 500, message = "Credential URL must be under 500 characters")
        String credentialUrl
) {
}
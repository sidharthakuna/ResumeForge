package com.resumebuilder.resume.dto.response;

import java.util.UUID;

public record PersonalInfoResponse(
        UUID id,
        String fullName,
        String jobTitle,
        String email,
        String phone,
        String location,
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl,
        String photoUrl
) {
}
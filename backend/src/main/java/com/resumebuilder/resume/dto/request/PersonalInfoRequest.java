package com.resumebuilder.resume.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PersonalInfoRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be under 100 characters")
        String fullName,

        @Size(max = 150, message = "Job title must be under 150 characters")
        String jobTitle,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 255, message = "Email must be under 255 characters")
        String email,

        @Size(max = 20, message = "Phone must be under 20 characters")
        String phone,

        @Size(max = 150, message = "Location must be under 150 characters")
        String location,

        @Size(max = 500, message = "LinkedIn URL must be under 500 characters")
        String linkedinUrl,

        @Size(max = 500, message = "GitHub URL must be under 500 characters")
        String githubUrl,

        @Size(max = 500, message = "Portfolio URL must be under 500 characters")
        String portfolioUrl,

        String photoUrl
) {
}
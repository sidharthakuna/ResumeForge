package com.resumebuilder.ai.context;

import java.util.List;
import java.util.UUID;

public record ResumeContext(
        UUID resumeId,
        String title,
        PersonalInfoContext personalInfo,
        List<EducationContext> education,
        List<ExperienceContext> experience,
        List<ProjectContext> projects,
        List<String> skills,
        List<CertificationContext> certifications,
        List<AchievementContext> achievements,
        List<LanguageContext> languages,
        String strengths,
        String currentSummary,
        String currentDeclaration
) {
    public record PersonalInfoContext(
            String fullName,
            String jobTitle,
            String location,
            String email,
            String linkedinUrl,
            String githubUrl
    ) {}

    public record EducationContext(
            String institution,
            String degree,
            String fieldOfStudy,
            String grade,
            String startDate,
            String endDate
    ) {}

    public record ExperienceContext(
            UUID id,
            String company,
            String jobTitle,
            String description,
            String startDate,
            String endDate,
            boolean currentlyWorking
    ) {}

    public record ProjectContext(
            UUID id,
            String title,
            String description,
            String githubUrl,
            String demoUrl
    ) {}

    public record CertificationContext(
            String name,
            String issuingOrganization
    ) {}

    public record AchievementContext(
            String title,
            String description,
            String issuer
    ) {}

    public record LanguageContext(
            String languageName,
            String proficiencyLevel
    ) {}
}

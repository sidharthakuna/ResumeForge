package com.resumebuilder.resume.dto.response;

import java.util.List;

public record FullResumeResponse(
        ResumeResponse resume,
        PersonalInfoResponse personalInfo,
        List<EducationResponse> education,
        List<ExperienceResponse> experience,
        List<ProjectResponse> projects,
        List<SkillResponse> skills,
        List<CertificationResponse> certifications,
        List<AchievementResponse> achievements,
        List<LanguageResponse> languages
) {
}
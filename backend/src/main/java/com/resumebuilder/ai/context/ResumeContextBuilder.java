package com.resumebuilder.ai.context;

import com.resumebuilder.resume.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class ResumeContextBuilder {

    public ResumeContext build(Resume resume) {
        if (resume == null) {
            return new ResumeContext(null, "", null, List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), "", "", "");
        }

        ResumeContext.PersonalInfoContext personalInfoCtx = null;
        if (resume.getPersonalInfo() != null) {
            PersonalInfo pi = resume.getPersonalInfo();
            personalInfoCtx = new ResumeContext.PersonalInfoContext(
                    pi.getFullName(),
                    pi.getJobTitle(),
                    pi.getLocation(),
                    pi.getEmail(),
                    pi.getLinkedinUrl(),
                    pi.getGithubUrl()
            );
        }

        List<ResumeContext.EducationContext> eduList = safeList(resume.getEducationList()).stream()
                .map(e -> new ResumeContext.EducationContext(
                        e.getInstitution(),
                        e.getDegree(),
                        e.getFieldOfStudy(),
                        e.getGrade(),
                        e.getStartDate() != null ? e.getStartDate().toString() : null,
                        e.getEndDate() != null ? e.getEndDate().toString() : null
                ))
                .toList();

        List<ResumeContext.ExperienceContext> expList = safeList(resume.getExperienceList()).stream()
                .map(e -> new ResumeContext.ExperienceContext(
                        e.getId(),
                        e.getCompany(),
                        e.getJobTitle(),
                        e.getDescription(),
                        e.getStartDate() != null ? e.getStartDate().toString() : null,
                        e.getEndDate() != null ? e.getEndDate().toString() : null,
                        e.isCurrentlyWorking()
                ))
                .toList();

        List<ResumeContext.ProjectContext> projList = safeList(resume.getProjectList()).stream()
                .map(p -> new ResumeContext.ProjectContext(
                        p.getId(),
                        p.getTitle(),
                        p.getDescription(),
                        p.getGithubUrl(),
                        p.getDemoUrl()
                ))
                .toList();

        List<String> skills = safeList(resume.getSkillList()).stream()
                .map(Skill::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        List<ResumeContext.CertificationContext> certList = safeList(resume.getCertificationList()).stream()
                .map(c -> new ResumeContext.CertificationContext(c.getName(), c.getIssuingOrganization()))
                .toList();

        List<ResumeContext.AchievementContext> achList = safeList(resume.getAchievementList()).stream()
                .map(a -> new ResumeContext.AchievementContext(a.getTitle(), a.getDescription(), a.getIssuer()))
                .toList();

        List<ResumeContext.LanguageContext> langList = safeList(resume.getLanguageList()).stream()
                .map(l -> new ResumeContext.LanguageContext(
                        l.getLanguageName(),
                        l.getProficiencyLevel() != null ? l.getProficiencyLevel().name() : null
                ))
                .toList();

        return new ResumeContext(
                resume.getId(),
                resume.getTitle(),
                personalInfoCtx,
                eduList,
                expList,
                projList,
                skills,
                certList,
                achList,
                langList,
                resume.getStrengths(),
                resume.getSummary(),
                resume.getDeclaration()
        );
    }

    public String formatForSummary(ResumeContext ctx) {
        StringBuilder sb = new StringBuilder();
        if (ctx.personalInfo() != null) {
            sb.append("Candidate Name: ").append(nvl(ctx.personalInfo().fullName(), "Candidate")).append("\n");
            if (ctx.personalInfo().jobTitle() != null) {
                sb.append("Current/Desired Title: ").append(ctx.personalInfo().jobTitle()).append("\n");
            }
        }

        if (!ctx.skills().isEmpty()) {
            sb.append("Verified Skills: ").append(String.join(", ", ctx.skills())).append("\n");
        }

        if (!ctx.experience().isEmpty()) {
            sb.append("Experience History:\n");
            for (ResumeContext.ExperienceContext exp : ctx.experience()) {
                sb.append(" - ").append(nvl(exp.jobTitle(), "Role")).append(" at ").append(nvl(exp.company(), "Company"));
                if (exp.description() != null && !exp.description().isBlank()) {
                    sb.append(": ").append(exp.description());
                }
                sb.append("\n");
            }
        }

        if (!ctx.projects().isEmpty()) {
            sb.append("Key Projects:\n");
            for (ResumeContext.ProjectContext p : ctx.projects()) {
                sb.append(" - ").append(p.title());
                if (p.description() != null && !p.description().isBlank()) {
                    sb.append(": ").append(p.description());
                }
                sb.append("\n");
            }
        }

        if (!ctx.education().isEmpty()) {
            sb.append("Education:\n");
            for (ResumeContext.EducationContext edu : ctx.education()) {
                sb.append(" - ").append(nvl(edu.degree(), "Degree")).append(" in ").append(nvl(edu.fieldOfStudy(), "Major"))
                        .append(" from ").append(nvl(edu.institution(), "Institution")).append("\n");
            }
        }

        if (ctx.strengths() != null && !ctx.strengths().isBlank()) {
            sb.append("Strengths: ").append(ctx.strengths()).append("\n");
        }

        return sb.toString();
    }

    public String formatAllContext(ResumeContext ctx) {
        StringBuilder sb = new StringBuilder();
        sb.append(formatForSummary(ctx));

        if (!ctx.certifications().isEmpty()) {
            sb.append("Certifications: ");
            sb.append(ctx.certifications().stream()
                    .map(c -> c.name() + " (" + nvl(c.issuingOrganization(), "Org") + ")")
                    .collect(Collectors.joining(", ")));
            sb.append("\n");
        }

        if (!ctx.achievements().isEmpty()) {
            sb.append("Achievements:\n");
            for (ResumeContext.AchievementContext a : ctx.achievements()) {
                sb.append(" - ").append(a.title());
                if (a.description() != null && !a.description().isBlank()) {
                    sb.append(": ").append(a.description());
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    private <T> List<T> safeList(List<T> list) {
        return list == null ? Collections.emptyList() : list;
    }

    private String nvl(String val, String def) {
        return val != null && !val.isBlank() ? val : def;
    }
}

package com.resumebuilder.template.engine;

import com.resumebuilder.resume.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResumeHtmlTemplate {

    public static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    public String renderTechModern(Resume resume) {
        PersonalInfo pi = resume.getPersonalInfo();
        String name = pi != null && pi.getFullName() != null ? esc(pi.getFullName()) : "Alex Rivera";
        String jobTitle = pi != null && pi.getJobTitle() != null ? esc(pi.getJobTitle()) : esc(resume.getTitle());
        String email = pi != null && pi.getEmail() != null ? esc(pi.getEmail()) : "";
        String phone = pi != null && pi.getPhone() != null ? esc(pi.getPhone()) : "";
        String location = pi != null && pi.getLocation() != null ? esc(pi.getLocation()) : "";

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/><style>")
          .append("body { font-family: sans-serif; color: #24292f; margin: 0; padding: 24px; }")
          .append(".header { border-bottom: 2px solid #0969da; padding-bottom: 12px; margin-bottom: 16px; }")
          .append(".name { font-size: 24px; font-weight: bold; color: #0969da; }")
          .append(".role { font-size: 13px; color: #57606a; margin-top: 4px; }")
          .append(".section { margin-bottom: 16px; }")
          .append(".section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #0969da; border-bottom: 1px solid #d0d7de; padding-bottom: 3px; margin-bottom: 8px; }")
          .append(".entry { margin-bottom: 8px; }")
          .append("</style></head><body>");

        // Header
        sb.append("<div class=\"header\"><div class=\"name\">").append(name).append("</div>");
        if (jobTitle != null && !jobTitle.isEmpty()) sb.append("<div class=\"role\">").append(jobTitle).append("</div>");
        sb.append("<div>").append(email).append(" | ").append(phone).append(" | ").append(location).append("</div></div>");

        // Summary
        if (resume.getSummary() != null && !resume.getSummary().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Professional Summary</div><p>")
              .append(esc(resume.getSummary())).append("</p></div>");
        }

        // Technical Skills
        if (resume.getSkillList() != null && !resume.getSkillList().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Technical Skills</div><ul>");
            for (Skill s : resume.getSkillList()) {
                sb.append("<li>").append(esc(s.getName())).append("</li>");
            }
            sb.append("</ul></div>");
        }

        // Experience
        if (resume.getExperienceList() != null && !resume.getExperienceList().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Experience</div>");
            for (Experience exp : resume.getExperienceList()) {
                sb.append("<div class=\"entry\"><strong>").append(esc(exp.getJobTitle())).append(" — ").append(esc(exp.getCompany())).append("</strong>");
                if (exp.getDescription() != null) sb.append("<p>").append(esc(exp.getDescription())).append("</p>");
                sb.append("</div>");
            }
            sb.append("</div>");
        }

        // Projects
        if (resume.getProjectList() != null && !resume.getProjectList().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Projects</div>");
            for (Project p : resume.getProjectList()) {
                sb.append("<div class=\"entry\"><strong>").append(esc(p.getTitle())).append("</strong>");
                if (p.getDescription() != null) sb.append("<p>").append(esc(p.getDescription())).append("</p>");
                sb.append("</div>");
            }
            sb.append("</div>");
        }

        // Education
        if (resume.getEducationList() != null && !resume.getEducationList().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Education</div>");
            for (Education ed : resume.getEducationList()) {
                sb.append("<div class=\"entry\"><strong>").append(esc(ed.getInstitution())).append("</strong> — ").append(esc(ed.getDegree())).append("</div>");
            }
            sb.append("</div>");
        }

        // Strengths
        if (resume.getStrengths() != null && !resume.getStrengths().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Strengths</div><p>")
              .append(esc(resume.getStrengths())).append("</p></div>");
        }

        // Languages
        if (resume.getLanguageList() != null && !resume.getLanguageList().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Languages</div><ul>");
            for (Language l : resume.getLanguageList()) {
                sb.append("<li>").append(esc(l.getLanguageName())).append("</li>");
            }
            sb.append("</ul></div>");
        }

        // Declaration
        if (resume.getDeclaration() != null && !resume.getDeclaration().isEmpty()) {
            sb.append("<div class=\"section\"><div class=\"section-title\">Declaration</div><p>")
              .append(esc(resume.getDeclaration())).append("</p></div>");
        }

        sb.append("</body></html>");
        return sb.toString();
    }

    public String renderTechAts(Resume resume) {
        PersonalInfo pi = resume.getPersonalInfo();
        String name = pi != null && pi.getFullName() != null ? esc(pi.getFullName()) : "Alex Rivera";
        String jobTitle = pi != null && pi.getJobTitle() != null ? esc(pi.getJobTitle()) : esc(resume.getTitle());
        String email = pi != null && pi.getEmail() != null ? esc(pi.getEmail()) : "";
        String phone = pi != null && pi.getPhone() != null ? esc(pi.getPhone()) : "";
        String location = pi != null && pi.getLocation() != null ? esc(pi.getLocation()) : "";

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/><style>")
          .append("body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 24px; }")
          .append("header { text-align: center; border-bottom: 1.5px solid #111; padding-bottom: 10px; margin-bottom: 14px; }")
          .append("h1 { font-size: 22px; margin: 0; }")
          .append("section { margin-bottom: 14px; }")
          .append("h2.section-title { font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 2px; margin-bottom: 6px; }")
          .append("</style></head><body>");

        sb.append("<header><h1>").append(name).append("</h1>");
        if (jobTitle != null && !jobTitle.isEmpty()) sb.append("<div><strong>").append(jobTitle).append("</strong></div>");
        sb.append("<div>").append(email).append(" | ").append(phone).append(" | ").append(location).append("</div></header>");

        if (resume.getSummary() != null && !resume.getSummary().isEmpty()) {
            sb.append("<section><h2 class=\"section-title\">Professional Summary</h2><p>").append(esc(resume.getSummary())).append("</p></section>");
        }

        if (resume.getExperienceList() != null && !resume.getExperienceList().isEmpty()) {
            sb.append("<section><h2 class=\"section-title\">Experience</h2>");
            for (Experience exp : resume.getExperienceList()) {
                sb.append("<div><strong>").append(esc(exp.getJobTitle())).append(" — ").append(esc(exp.getCompany())).append("</strong>");
                if (exp.getDescription() != null) sb.append("<p>").append(esc(exp.getDescription())).append("</p>");
                sb.append("</div>");
            }
            sb.append("</section>");
        }

        if (resume.getProjectList() != null && !resume.getProjectList().isEmpty()) {
            sb.append("<section><h2 class=\"section-title\">Projects</h2>");
            for (Project p : resume.getProjectList()) {
                sb.append("<div><strong>").append(esc(p.getTitle())).append("</strong>");
                if (p.getDescription() != null) sb.append("<p>").append(esc(p.getDescription())).append("</p>");
                sb.append("</div>");
            }
            sb.append("</section>");
        }

        if (resume.getEducationList() != null && !resume.getEducationList().isEmpty()) {
            sb.append("<section><h2 class=\"section-title\">Education</h2>");
            for (Education ed : resume.getEducationList()) {
                sb.append("<div><strong>").append(esc(ed.getInstitution())).append("</strong> — ").append(esc(ed.getDegree())).append("</div>");
            }
            sb.append("</section>");
        }

        if (resume.getSkillList() != null && !resume.getSkillList().isEmpty()) {
            sb.append("<section><h2 class=\"section-title\">Technical Skills</h2><ul>");
            for (Skill s : resume.getSkillList()) {
                sb.append("<li>").append(esc(s.getName())).append("</li>");
            }
            sb.append("</ul></section>");
        }

        if (resume.getStrengths() != null && !resume.getStrengths().isEmpty()) {
            sb.append("<section><h2 class=\"section-title\">Strengths</h2><p>").append(esc(resume.getStrengths())).append("</p></section>");
        }

        if (resume.getDeclaration() != null && !resume.getDeclaration().isEmpty()) {
            sb.append("<section><h2 class=\"section-title\">Declaration</h2><p>").append(esc(resume.getDeclaration())).append("</p></section>");
        }

        sb.append("</body></html>");
        return sb.toString();
    }

    public String renderEmeraldSidebar(Resume resume) {
        PersonalInfo pi = resume.getPersonalInfo();
        String name = pi != null && pi.getFullName() != null ? esc(pi.getFullName()) : "Alex Rivera";
        String jobTitle = pi != null && pi.getJobTitle() != null ? esc(pi.getJobTitle()) : esc(resume.getTitle());

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/><style>")
          .append("body { font-family: sans-serif; margin: 0; display: flex; }")
          .append(".sidebar { width: 33%; background: #233d32; color: #fff; padding: 24px; }")
          .append(".profile-photo { width: 86px; height: 86px; border-radius: 50%; object-fit: cover; }")
          .append(".main-content { width: 67%; padding: 24px; background: #fff; }")
          .append("</style></head><body>");

        sb.append("<div class=\"sidebar\">");
        String photoHtml;
        if (pi != null && pi.getPhotoUrl() != null && !pi.getPhotoUrl().isBlank()) {
            photoHtml = "<img src=\"" + esc(pi.getPhotoUrl()) + "\" alt=\"Photo\" class=\"profile-photo\"/>";
        } else {
            String initial = (name != null && !name.isBlank()) ? name.trim().substring(0, 1).toUpperCase() : "A";
            photoHtml = "<div class=\"photo-placeholder\">" + initial + "</div>";
        }
        sb.append(photoHtml);
        sb.append("<h2>").append(name).append("</h2>");
        if (jobTitle != null && !jobTitle.isEmpty()) sb.append("<div>").append(jobTitle).append("</div>");
        sb.append("<div><h3>Skills</h3><ul>");
        if (resume.getSkillList() != null) {
            for (Skill s : resume.getSkillList()) sb.append("<li>").append(esc(s.getName())).append("</li>");
        }
        sb.append("</ul></div>");
        sb.append("<div><h3>Languages</h3><ul>");
        if (resume.getLanguageList() != null) {
            for (Language l : resume.getLanguageList()) sb.append("<li>").append(esc(l.getLanguageName())).append("</li>");
        }
        sb.append("</ul></div>");
        sb.append("</div>");

        sb.append("<div class=\"main-content\">");
        if (resume.getSummary() != null) sb.append("<h3>Summary</h3><p>").append(esc(resume.getSummary())).append("</p>");
        sb.append("<h3>Education</h3>");
        if (resume.getEducationList() != null) {
            for (Education ed : resume.getEducationList()) sb.append("<div>").append(esc(ed.getInstitution())).append("</div>");
        }
        sb.append("<h3>Experience</h3>");
        if (resume.getExperienceList() != null) {
            for (Experience exp : resume.getExperienceList()) sb.append("<div>").append(esc(exp.getJobTitle())).append(" — ").append(esc(exp.getCompany())).append("</div>");
        }
        sb.append("<h3>Projects</h3>");
        if (resume.getProjectList() != null) {
            for (Project p : resume.getProjectList()) sb.append("<div>").append(esc(p.getTitle())).append("</div>");
        }
        sb.append("</div>");

        sb.append("</body></html>");
        return sb.toString();
    }
}

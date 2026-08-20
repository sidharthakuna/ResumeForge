package com.resumebuilder.ai.prompt;

import com.resumebuilder.ai.dto.ParseMarkdownResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProjectPromptBuilder {

    public String buildPrompt(String title, String currentDescription, ParseMarkdownResponse parsedReadme, List<String> verifiedSkills, String targetJobTitle, String targetJobDescription) {
        StringBuilder sb = new StringBuilder();
        sb.append("TASK: Write 2 to 4 technical, ATS-optimized bullet points for the following software project.\n\n");

        sb.append("PROJECT DETAILS:\n");
        sb.append("Project Title: ").append(title != null ? title : "Project").append("\n");
        if (currentDescription != null && !currentDescription.isBlank()) {
            sb.append("Current Notes/Summary: ").append(currentDescription).append("\n");
        }

        if (parsedReadme != null) {
            sb.append("\nPROJECT DOCUMENTATION (README.MD ANALYSIS):\n");
            if (parsedReadme.summary() != null && !parsedReadme.summary().isBlank()) {
                sb.append("Overview: ").append(parsedReadme.summary()).append("\n");
            }
            if (!parsedReadme.technologies().isEmpty()) {
                sb.append("Technologies in Project: ").append(String.join(", ", parsedReadme.technologies())).append("\n");
            }
            if (!parsedReadme.keyFeatures().isEmpty()) {
                sb.append("Key Features: ").append(String.join("; ", parsedReadme.keyFeatures())).append("\n");
            }
            if (!parsedReadme.databaseAndApis().isEmpty()) {
                sb.append("APIs & Data: ").append(String.join("; ", parsedReadme.databaseAndApis())).append("\n");
            }
            if (!parsedReadme.architecturePoints().isEmpty()) {
                sb.append("Architecture Highlights: ").append(String.join("; ", parsedReadme.architecturePoints())).append("\n");
            }
        }

        if (verifiedSkills != null && !verifiedSkills.isEmpty()) {
            sb.append("\nCANDIDATE'S VERIFIED SKILLS:\n").append(String.join(", ", verifiedSkills)).append("\n");
        }

        if (targetJobDescription != null && !targetJobDescription.isBlank()) {
            sb.append("\nTARGET JOB CONTEXT:\n");
            if (targetJobTitle != null && !targetJobTitle.isBlank()) {
                sb.append("Target Role: ").append(targetJobTitle).append("\n");
            }
            sb.append("Job Description: ").append(targetJobDescription.trim()).append("\n");
        }

        sb.append("""
                \nOUTPUT FORMAT:
                Return ONLY a JSON object with this exact structure:
                {
                  "bullets": [
                    "Architected and deployed a full-stack web application using Java 21 and Spring Boot, implementing RESTful APIs for...",
                    "Integrated PostgreSQL database layer with JPA/Hibernate for secure persistence...",
                    "Containerized the backend with Docker and implemented JWT token authentication..."
                  ],
                  "extractedTech": ["Java 21", "Spring Boot", "PostgreSQL", "Docker", "JWT"],
                  "matchedKeywords": ["Java", "Spring Boot", "PostgreSQL"]
                }
                
                CONSTRAINTS:
                - Emphasize technical architecture, core functionality, database/API design, and real technologies used.
                - Never invent technologies that do not appear in the project details, README, or candidate skills.
                - Each bullet must begin with a strong technical action verb.
                """);

        return sb.toString();
    }
}

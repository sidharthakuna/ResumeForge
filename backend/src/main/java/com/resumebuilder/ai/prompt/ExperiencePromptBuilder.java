package com.resumebuilder.ai.prompt;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExperiencePromptBuilder {

    public String buildPrompt(String company, String jobTitle, String currentDescription, List<String> verifiedSkills, String targetJobTitle, String targetJobDescription) {
        StringBuilder sb = new StringBuilder();
        sb.append("TASK: Refine the following work experience into 3 to 5 high-impact, ATS-optimized resume bullet points.\n\n");

        sb.append("EXPERIENCE TO REFINE:\n");
        sb.append("Company: ").append(company != null ? company : "Company").append("\n");
        sb.append("Role/Title: ").append(jobTitle != null ? jobTitle : "Role").append("\n");
        sb.append("User Description / Raw Notes:\n").append(currentDescription != null && !currentDescription.isBlank() ? currentDescription : "Developed core software components.").append("\n\n");

        if (verifiedSkills != null && !verifiedSkills.isEmpty()) {
            sb.append("CANDIDATE VERIFIED SKILLS:\n").append(String.join(", ", verifiedSkills)).append("\n\n");
        }

        if (targetJobDescription != null && !targetJobDescription.isBlank()) {
            sb.append("TARGET JOB CONTEXT (Use for alignment, vocabulary, and emphasis):\n");
            if (targetJobTitle != null && !targetJobTitle.isBlank()) {
                sb.append("Target Role: ").append(targetJobTitle).append("\n");
            }
            sb.append("Job Description: ").append(targetJobDescription.trim()).append("\n\n");
        }

        sb.append("""
                OUTPUT FORMAT:
                Return ONLY a JSON object with this exact structure:
                {
                  "bullets": [
                    "Engineered...",
                    "Streamlined...",
                    "Collaborated with..."
                  ],
                  "matchedKeywords": ["Java", "REST APIs"]
                }
                
                CONSTRAINTS:
                - Each bullet must start with a powerful past-tense action verb (e.g. Architected, Developed, Designed, Implemented).
                - Retain any existing numbers/metrics accurately (e.g. 40%, 10ms, 5 members); DO NOT invent new numerical statistics if none were provided.
                - Keep each bullet concise (1 to 2 lines).
                - Do not mention technologies not used in this role or candidate's skills.
                """);

        return sb.toString();
    }
}

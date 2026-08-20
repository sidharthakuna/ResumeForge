package com.resumebuilder.ai.prompt;

import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.context.ResumeContextBuilder;
import org.springframework.stereotype.Component;

@Component
public class TailoringPromptBuilder {

    private final ResumeContextBuilder contextBuilder;

    public TailoringPromptBuilder(ResumeContextBuilder contextBuilder) {
        this.contextBuilder = contextBuilder;
    }

    public String buildPrompt(ResumeContext context, String targetJobTitle, String targetJobDescription) {
        String candidateData = contextBuilder.formatAllContext(context);

        StringBuilder sb = new StringBuilder();
        sb.append("TASK: Perform a comprehensive, grounded Resume Tailoring for the Candidate targeted specifically toward the Recruiter's Job Description.\n\n");

        if (targetJobTitle != null && !targetJobTitle.isBlank()) {
            sb.append("TARGET JOB TITLE:\n").append(targetJobTitle).append("\n\n");
        }

        if (targetJobDescription != null && !targetJobDescription.isBlank()) {
            sb.append("TARGET JOB DESCRIPTION:\n").append(targetJobDescription.trim()).append("\n\n");
        }

        sb.append("CANDIDATE'S VERIFIED RESUME DATA:\n").append(candidateData).append("\n\n");

        sb.append("""
                OUTPUT REQUIREMENTS:
                Return ONLY a JSON object with this exact structure:
                {
                  "summary": "2-4 sentence tailored professional summary highlighting matching competencies.",
                  "experience": [
                    {
                      "experienceId": "uuid-if-available",
                      "company": "Company Name",
                      "jobTitle": "Job Title",
                      "bullets": ["Action-verb bullet point 1...", "Action-verb bullet point 2..."]
                    }
                  ],
                  "projects": [
                    {
                      "projectId": "uuid-if-available",
                      "title": "Project Title",
                      "bullets": ["Action-verb technical bullet 1...", "Action-verb technical bullet 2..."],
                      "techStack": ["Java", "Spring Boot", "PostgreSQL"]
                    }
                  ],
                  "prioritizedSkills": ["Skill 1 (highest relevance to JD)", "Skill 2", "Skill 3"],
                  "matchedSkills": ["Skill 1", "Skill 2"],
                  "missingSkills": ["Missing Skill 1"]
                }
                
                STRICT GROUNDING RULES:
                - Do NOT invent any skill, technology, company, metric, or accomplishment not present in the candidate data.
                - Reorder existing verified skills so that those most relevant to the JD appear first.
                - Tailor summary, experience bullets, and project bullets to emphasize genuine matching strengths.
                """);

        return sb.toString();
    }
}

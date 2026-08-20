package com.resumebuilder.ai.prompt;

import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.context.ResumeContextBuilder;
import org.springframework.stereotype.Component;

@Component
public class AtsPromptBuilder {

    private final ResumeContextBuilder contextBuilder;

    public AtsPromptBuilder(ResumeContextBuilder contextBuilder) {
        this.contextBuilder = contextBuilder;
    }

    public String buildPrompt(ResumeContext context, String targetJobTitle, String targetJobDescription) {
        String candidateData = contextBuilder.formatAllContext(context);

        StringBuilder sb = new StringBuilder();
        sb.append("TASK: Perform an Applicant Tracking System (ATS) optimization analysis comparing the Candidate's Resume against the Target Job Description.\n\n");

        if (targetJobTitle != null && !targetJobTitle.isBlank()) {
            sb.append("TARGET JOB TITLE:\n").append(targetJobTitle).append("\n\n");
        }

        if (targetJobDescription != null && !targetJobDescription.isBlank()) {
            sb.append("TARGET JOB DESCRIPTION:\n").append(targetJobDescription.trim()).append("\n\n");
        } else {
            sb.append("TARGET JOB DESCRIPTION:\nGeneral Software Engineering Role\n\n");
        }

        sb.append("CANDIDATE'S CURRENT RESUME DATA:\n").append(candidateData).append("\n\n");

        sb.append("""
                OUTPUT FORMAT:
                Return ONLY a JSON object with this exact structure:
                {
                  "score": 78,
                  "matchedKeywords": ["Java", "Spring Boot", "PostgreSQL", "REST APIs", "Docker"],
                  "missingKeywords": ["AWS", "Kubernetes", "Microservices"],
                  "suggestions": [
                    "Highlight backend API security and JWT authentication in your summary.",
                    "Ensure database query optimization in PostgreSQL is clearly articulated in experience bullets."
                  ],
                  "strengths": [
                    "Core backend framework match with Java and Spring Boot is exceptionally strong."
                  ],
                  "formattingWarnings": []
                }
                
                CONSTRAINTS:
                - Score must be an integer between 0 and 100 reflecting keyword and competency alignment.
                - DO NOT suggest fabricating missing skills. Only suggest rephrasing or elevating genuine existing experience.
                """);

        return sb.toString();
    }
}

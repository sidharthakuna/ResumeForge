package com.resumebuilder.ai.prompt;

import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.context.ResumeContextBuilder;
import com.resumebuilder.ai.dto.JobAnalysisResponse;
import org.springframework.stereotype.Component;

@Component
public class SummaryPromptBuilder {

    private final ResumeContextBuilder contextBuilder;

    public SummaryPromptBuilder(ResumeContextBuilder contextBuilder) {
        this.contextBuilder = contextBuilder;
    }

    public String buildPrompt(ResumeContext context, String targetJobTitle, String targetJobDescription, JobAnalysisResponse jobAnalysis) {
        String formattedData = contextBuilder.formatAllContext(context);
        boolean hasJobDescription = targetJobDescription != null && !targetJobDescription.isBlank();
        String effectiveTitle = (targetJobTitle != null && !targetJobTitle.isBlank())
                ? targetJobTitle.trim()
                : (context.personalInfo() != null && context.personalInfo().jobTitle() != null ? context.personalInfo().jobTitle() : "Software Professional");

        StringBuilder sb = new StringBuilder();
        sb.append("TASK: Write an executive, ATS-friendly Professional Summary (2 to 4 sentences maximum) for the following candidate.\n\n");

        sb.append("TARGET JOB TITLE:\n").append(effectiveTitle).append("\n\n");

        if (hasJobDescription) {
            sb.append("RECRUITER JOB DESCRIPTION (USE FOR RELEVANCE AND PRIORITIZATION ONLY):\n")
                    .append(targetJobDescription.trim()).append("\n\n");

            if (jobAnalysis != null) {
                sb.append("JOB ANALYSIS SIGNALS:\n");
                sb.append("- Matched Verified Skills: ").append(String.join(", ", jobAnalysis.keywords())).append("\n");
                sb.append("- Missing Requirements (DO NOT CLAIM THESE): ").append(String.join(", ", jobAnalysis.missingSkills())).append("\n\n");
            }
        }

        sb.append("CANDIDATE'S VERIFIED PROFILE:\n").append(formattedData).append("\n\n");

        sb.append("""
                OUTPUT FORMAT:
                Return ONLY a JSON object with this exact structure:
                {
                  "summary": "2-4 sentence tailored summary written in third-person without pronouns or first-person, highlighting verified matching competencies.",
                  "matchedSkills": ["skill1", "skill2"],
                  "missingSkills": ["missingSkill1"],
                  "tailoredFocus": "Brief 1-sentence note explaining what strengths this summary emphasizes"
                }
                
                CONSTRAINTS:
                - Never invent skills, metrics, cloud experience, or responsibilities.
                - Max 4 sentences.
                - Emphasize strongest matching verified skills and projects.
                """);

        return sb.toString();
    }
}

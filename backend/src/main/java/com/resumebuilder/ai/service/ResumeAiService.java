package com.resumebuilder.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.context.ResumeContextBuilder;
import com.resumebuilder.ai.dto.*;
import com.resumebuilder.ai.llm.AiGenerationRequest;
import com.resumebuilder.ai.llm.AiGenerationResponse;
import com.resumebuilder.ai.llm.LlmService;
import com.resumebuilder.ai.prompt.*;
import com.resumebuilder.resume.entity.Experience;
import com.resumebuilder.resume.entity.Project;
import com.resumebuilder.resume.entity.Resume;
import com.resumebuilder.resume.entity.Skill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeAiService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAiService.class);

    private static final Pattern METRIC_PATTERN = Pattern.compile(
            "\\b(\\d+(?:[.,]\\d+)?\\s?(?:%|percent|x|k|K|M|B)\\b|\\$\\s?\\d+(?:[.,]\\d+)?\\s?(?:k|K|M|B)?\\b|\\b\\d{2,}\\b)"
    );

    private static final List<String> SUMMARY_OPENERS = List.of(
            "%s with hands-on experience across %s.",
            "%s focused on %s.",
            "%s who has worked across %s.",
            "%s with practical experience in %s."
    );

    private final LlmService llmService;
    private final ResumeContextBuilder contextBuilder;
    private final JobDescriptionAnalyzer jobDescriptionAnalyzer;
    private final MarkdownParserService markdownParserService;
    private final SummaryPromptBuilder summaryPromptBuilder;
    private final ExperiencePromptBuilder experiencePromptBuilder;
    private final ProjectPromptBuilder projectPromptBuilder;
    private final AtsPromptBuilder atsPromptBuilder;
    private final TailoringPromptBuilder tailoringPromptBuilder;
    private final ObjectMapper objectMapper;

    public ResumeAiService(
            LlmService llmService,
            ResumeContextBuilder contextBuilder,
            JobDescriptionAnalyzer jobDescriptionAnalyzer,
            MarkdownParserService markdownParserService,
            SummaryPromptBuilder summaryPromptBuilder,
            ExperiencePromptBuilder experiencePromptBuilder,
            ProjectPromptBuilder projectPromptBuilder,
            AtsPromptBuilder atsPromptBuilder,
            TailoringPromptBuilder tailoringPromptBuilder,
            ObjectMapper objectMapper
    ) {
        this.llmService = llmService;
        this.contextBuilder = contextBuilder;
        this.jobDescriptionAnalyzer = jobDescriptionAnalyzer;
        this.markdownParserService = markdownParserService;
        this.summaryPromptBuilder = summaryPromptBuilder;
        this.experiencePromptBuilder = experiencePromptBuilder;
        this.projectPromptBuilder = projectPromptBuilder;
        this.atsPromptBuilder = atsPromptBuilder;
        this.tailoringPromptBuilder = tailoringPromptBuilder;
        this.objectMapper = objectMapper;
    }

    public String generateSummary(Resume resume, String targetJobTitle, String targetJobDescription) {
        AiSummaryPreviewResponse preview = generateSummaryPreview(resume, targetJobTitle, targetJobDescription);
        return preview.summary();
    }

    public AiSummaryPreviewResponse generateSummaryPreview(Resume resume, String targetJobTitle, String targetJobDescription) {
        ResumeContext ctx = contextBuilder.build(resume);
        JobAnalysisResponse jobAnalysis = jobDescriptionAnalyzer.analyze(targetJobTitle, targetJobDescription, ctx);

        if (llmService.isAvailable()) {
            try {
                String prompt = summaryPromptBuilder.buildPrompt(ctx, targetJobTitle, targetJobDescription, jobAnalysis);
                AiGenerationRequest req = AiGenerationRequest.builder()
                        .systemInstruction(ResumeAiPrompts.SYSTEM_INSTRUCTION)
                        .prompt(prompt)
                        .jsonResponse()
                        .temperature(0.2)
                        .build();

                AiGenerationResponse res = llmService.generate(req);
                JsonNode root = objectMapper.readTree(res.text());
                String summary = root.path("summary").asText("").trim();
                List<String> matched = jsonArrayToStringList(root.path("matchedSkills"));
                List<String> missing = jsonArrayToStringList(root.path("missingSkills"));
                String focus = root.path("tailoredFocus").asText("Tailored professional summary").trim();

                if (!summary.isBlank()) {
                    return new AiSummaryPreviewResponse(
                            summary,
                            targetJobTitle != null && !targetJobTitle.isBlank() ? targetJobTitle : "Software Professional",
                            matched.isEmpty() ? jobAnalysis.keywords() : matched,
                            missing.isEmpty() ? jobAnalysis.missingSkills() : missing,
                            focus
                    );
                }
            } catch (Exception ex) {
                log.warn("LLM summary generation failed, falling back to deterministic: {}", ex.getMessage());
            }
        }

        String fallbackSummary = generateDeterministicSummary(resume, targetJobTitle, targetJobDescription);
        return new AiSummaryPreviewResponse(
                fallbackSummary,
                targetJobTitle != null && !targetJobTitle.isBlank() ? targetJobTitle : "Software Professional",
                jobAnalysis.keywords(),
                jobAnalysis.missingSkills(),
                "Deterministic synthesized summary"
        );
    }

    public String generateDeclaration(Resume resume, String city) {
        String fullName = resume.getPersonalInfo() != null && resume.getPersonalInfo().getFullName() != null
                ? resume.getPersonalInfo().getFullName().trim()
                : "the undersigned";

        String locationClause = (city != null && !city.isBlank())
                ? " at " + city.trim()
                : "";

        return "I, %s, hereby declare that the information provided above is true and accurate to the best of my knowledge%s.".formatted(fullName, locationClause);
    }

    public AiExperienceResponse generateExperienceBullets(
            UUID experienceId,
            String company,
            String jobTitle,
            String currentDescription,
            List<String> verifiedSkills,
            String targetJobTitle,
            String targetJobDescription
    ) {
        if (llmService.isAvailable()) {
            try {
                String prompt = experiencePromptBuilder.buildPrompt(
                        company, jobTitle, currentDescription, verifiedSkills, targetJobTitle, targetJobDescription);

                AiGenerationRequest req = AiGenerationRequest.builder()
                        .systemInstruction(ResumeAiPrompts.SYSTEM_INSTRUCTION)
                        .prompt(prompt)
                        .jsonResponse()
                        .temperature(0.2)
                        .build();

                AiGenerationResponse res = llmService.generate(req);
                JsonNode root = objectMapper.readTree(res.text());
                List<String> bullets = jsonArrayToStringList(root.path("bullets"));
                List<String> matchedKeywords = jsonArrayToStringList(root.path("matchedKeywords"));

                if (!bullets.isEmpty()) {
                    return new AiExperienceResponse(experienceId, company, jobTitle, bullets, matchedKeywords);
                }
            } catch (Exception ex) {
                log.warn("LLM experience bullet generation failed, falling back to deterministic: {}", ex.getMessage());
            }
        }

        List<String> fallbackBullets = buildDeterministicBullets(currentDescription, jobTitle, company);
        return new AiExperienceResponse(experienceId, company, jobTitle, fallbackBullets, List.of());
    }

    public AiProjectResponse generateProjectBullets(
            UUID projectId,
            String title,
            String currentDescription,
            String readmeContent,
            List<String> verifiedSkills,
            String targetJobTitle,
            String targetJobDescription
    ) {
        ParseMarkdownResponse parsedReadme = null;
        if (readmeContent != null && !readmeContent.isBlank()) {
            parsedReadme = markdownParserService.parse(readmeContent);
        }

        if (llmService.isAvailable()) {
            try {
                String prompt = projectPromptBuilder.buildPrompt(
                        title, currentDescription, parsedReadme, verifiedSkills, targetJobTitle, targetJobDescription);

                AiGenerationRequest req = AiGenerationRequest.builder()
                        .systemInstruction(ResumeAiPrompts.SYSTEM_INSTRUCTION)
                        .prompt(prompt)
                        .jsonResponse()
                        .temperature(0.2)
                        .build();

                AiGenerationResponse res = llmService.generate(req);
                JsonNode root = objectMapper.readTree(res.text());
                List<String> bullets = jsonArrayToStringList(root.path("bullets"));
                List<String> extractedTech = jsonArrayToStringList(root.path("extractedTech"));
                List<String> matchedKeywords = jsonArrayToStringList(root.path("matchedKeywords"));

                if (!bullets.isEmpty()) {
                    return new AiProjectResponse(projectId, title, bullets, extractedTech, matchedKeywords);
                }
            } catch (Exception ex) {
                log.warn("LLM project bullet generation failed, falling back to deterministic: {}", ex.getMessage());
            }
        }

        List<String> fallbackBullets = new ArrayList<>();
        if (currentDescription != null && !currentDescription.isBlank()) {
            fallbackBullets = Arrays.stream(currentDescription.split("\\R|(?<=[.!?])\\s+"))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .limit(4)
                    .toList();
        }
        if (fallbackBullets.isEmpty()) {
            fallbackBullets = List.of("Designed and built " + (title != null ? title : "the application") + " to provide robust and scalable functionality.");
        }

        List<String> tech = parsedReadme != null ? parsedReadme.technologies() : List.of();
        return new AiProjectResponse(projectId, title, fallbackBullets, tech, List.of());
    }

    public SkillPrioritizationResponse prioritizeSkills(Resume resume, String targetJobTitle, String targetJobDescription) {
        ResumeContext ctx = contextBuilder.build(resume);
        List<String> originalSkills = ctx.skills();

        if (originalSkills.isEmpty()) {
            return new SkillPrioritizationResponse(List.of(), 0, List.of());
        }

        JobAnalysisResponse jobAnalysis = jobDescriptionAnalyzer.analyze(targetJobTitle, targetJobDescription, ctx);

        Set<String> matchedSet = jobAnalysis.keywords().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<String> prioritized = new ArrayList<>();
        List<String> remaining = new ArrayList<>();

        for (String skill : originalSkills) {
            if (matchedSet.contains(skill.toLowerCase())) {
                prioritized.add(skill);
            } else {
                remaining.add(skill);
            }
        }

        prioritized.addAll(remaining);

        return new SkillPrioritizationResponse(
                prioritized,
                prioritized.size() - remaining.size(),
                jobAnalysis.missingSkills()
        );
    }

    public AtsAnalysisResponse analyzeAts(Resume resume, String targetJobTitle, String targetJobDescription) {
        ResumeContext ctx = contextBuilder.build(resume);
        JobAnalysisResponse jobAnalysis = jobDescriptionAnalyzer.analyze(targetJobTitle, targetJobDescription, ctx);

        if (llmService.isAvailable()) {
            try {
                String prompt = atsPromptBuilder.buildPrompt(ctx, targetJobTitle, targetJobDescription);
                AiGenerationRequest req = AiGenerationRequest.builder()
                        .systemInstruction(ResumeAiPrompts.SYSTEM_INSTRUCTION)
                        .prompt(prompt)
                        .jsonResponse()
                        .temperature(0.1)
                        .build();

                AiGenerationResponse res = llmService.generate(req);
                JsonNode root = objectMapper.readTree(res.text());

                int score = root.path("score").asInt(jobAnalysis.matchScore());
                List<String> matched = jsonArrayToStringList(root.path("matchedKeywords"));
                List<String> missing = jsonArrayToStringList(root.path("missingKeywords"));
                List<String> suggestions = jsonArrayToStringList(root.path("suggestions"));
                List<String> strengths = jsonArrayToStringList(root.path("strengths"));
                List<String> formattingWarnings = jsonArrayToStringList(root.path("formattingWarnings"));

                return new AtsAnalysisResponse(
                        Math.max(0, Math.min(100, score)),
                        matched.isEmpty() ? jobAnalysis.keywords() : matched,
                        missing.isEmpty() ? jobAnalysis.missingSkills() : missing,
                        suggestions,
                        strengths,
                        formattingWarnings
                );
            } catch (Exception ex) {
                log.warn("LLM ATS analysis failed, falling back to deterministic: {}", ex.getMessage());
            }
        }

        List<String> suggestions = new ArrayList<>();
        if (!jobAnalysis.missingSkills().isEmpty()) {
            suggestions.add("The job specifies keywords (" + String.join(", ", jobAnalysis.missingSkills().stream().limit(3).toList()) + ") not currently found in your resume profile.");
        }
        suggestions.add("Ensure bullet points in your experience section clearly state technical outcomes.");

        return new AtsAnalysisResponse(
                jobAnalysis.matchScore(),
                jobAnalysis.keywords(),
                jobAnalysis.missingSkills(),
                suggestions,
                List.of("Core skills and experiences are cleanly organized and easily parseable by ATS."),
                List.of()
        );
    }

    public ResumeTailoringResponse tailorResume(Resume resume, String targetJobTitle, String targetJobDescription) {
        ResumeContext ctx = contextBuilder.build(resume);
        JobAnalysisResponse jobAnalysis = jobDescriptionAnalyzer.analyze(targetJobTitle, targetJobDescription, ctx);
        AiSummaryPreviewResponse summaryPreview = generateSummaryPreview(resume, targetJobTitle, targetJobDescription);
        SkillPrioritizationResponse skillPrioritization = prioritizeSkills(resume, targetJobTitle, targetJobDescription);
        AtsAnalysisResponse atsAnalysis = analyzeAts(resume, targetJobTitle, targetJobDescription);

        List<TailoredExperienceItem> tailoredExperiences = new ArrayList<>();
        for (ResumeContext.ExperienceContext exp : ctx.experience()) {
            AiExperienceResponse expResponse = generateExperienceBullets(
                    exp.id(), exp.company(), exp.jobTitle(), exp.description(), ctx.skills(), targetJobTitle, targetJobDescription);
            tailoredExperiences.add(new TailoredExperienceItem(exp.id(), exp.company(), exp.jobTitle(), expResponse.bullets()));
        }

        List<TailoredProjectItem> tailoredProjects = new ArrayList<>();
        for (ResumeContext.ProjectContext proj : ctx.projects()) {
            AiProjectResponse projResponse = generateProjectBullets(
                    proj.id(), proj.title(), proj.description(), null, ctx.skills(), targetJobTitle, targetJobDescription);
            tailoredProjects.add(new TailoredProjectItem(proj.id(), proj.title(), projResponse.bullets(), projResponse.extractedTech()));
        }

        return new ResumeTailoringResponse(
                summaryPreview.summary(),
                tailoredExperiences,
                tailoredProjects,
                skillPrioritization.prioritizedSkills(),
                jobAnalysis.keywords(),
                jobAnalysis.missingSkills(),
                atsAnalysis
        );
    }

    public ParseMarkdownResponse parseMarkdown(String markdownContent) {
        return markdownParserService.parse(markdownContent);
    }

    // ---- Fallback deterministic helpers --------------------------------

    private String generateDeterministicSummary(Resume resume, String targetJobTitle, String targetJobDescription) {
        List<Experience> experience = safeList(resume.getExperienceList());
        List<Skill> skills = safeList(resume.getSkillList());
        List<Project> projects = safeList(resume.getProjectList());

        String roleLabel = resolveRoleLabel(targetJobTitle, experience);
        String skillPhrase = buildSkillPhrase(skills, targetJobDescription);

        StringBuilder sb = new StringBuilder();
        int hash = resume.getId() != null ? resume.getId().hashCode() : 42;
        String opener = SUMMARY_OPENERS.get(Math.floorMod(hash, SUMMARY_OPENERS.size()));
        sb.append(opener.formatted(roleLabel, skillPhrase.isBlank() ? "software development" : skillPhrase));

        String metricLine = findBestMetricSentence(experience);
        if (metricLine != null) {
            sb.append(" ").append(metricLine);
        } else if (!experience.isEmpty()) {
            Experience mostRecent = experience.get(experience.size() - 1);
            sb.append(" Most recently %s at %s%s.".formatted(
                    lowerFirst(mostRecent.getJobTitle()),
                    mostRecent.getCompany(),
                    mostRecent.isCurrentlyWorking() ? ", currently in the role" : ""));
        } else if (!projects.isEmpty()) {
            Project p = projects.get(0);
            sb.append(" Has built and shipped independent projects, including %s.".formatted(p.getTitle()));
        }

        if (targetJobTitle != null && !targetJobTitle.isBlank()) {
            sb.append(" Seeking to bring this background to a %s role.".formatted(targetJobTitle.trim()));
        }

        return capSentenceCount(sb.toString().trim(), 4);
    }

    private List<String> buildDeterministicBullets(String description, String jobTitle, String company) {
        if (description != null && !description.isBlank()) {
            List<String> lines = Arrays.stream(description.split("\\R|(?<=[.!?])\\s+"))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .map(s -> {
                        String clean = s.startsWith("-") || s.startsWith("*") || s.startsWith("•")
                                ? s.substring(1).trim()
                                : s;
                        return clean;
                    })
                    .filter(s -> !s.isBlank())
                    .limit(5)
                    .toList();
            if (!lines.isEmpty()) return lines;
        }

        return List.of(
                "Developed core functional modules and assisted with technical deliveries as %s at %s.".formatted(
                        jobTitle != null ? jobTitle : "Software Engineer", company != null ? company : "the organization"),
                "Collaborated with cross-functional team members to implement robust and testable software solutions."
        );
    }

    private String resolveRoleLabel(String targetJobTitle, List<Experience> experience) {
        if (targetJobTitle != null && !targetJobTitle.isBlank()) {
            return capitalizeFirst(targetJobTitle.trim());
        }
        if (!experience.isEmpty()) {
            return capitalizeFirst(experience.get(experience.size() - 1).getJobTitle());
        }
        return "Motivated professional";
    }

    private String buildSkillPhrase(List<Skill> skills, String targetJobDescription) {
        if (skills.isEmpty()) return "";
        List<String> names = skills.stream()
                .map(Skill::getName)
                .filter(n -> n != null && !n.isBlank())
                .map(String::trim)
                .toList();

        if (names.isEmpty()) return "";

        List<String> prioritized = names;
        if (targetJobDescription != null && !targetJobDescription.isBlank()) {
            String jdLower = targetJobDescription.toLowerCase();
            List<String> matched = names.stream()
                    .filter(n -> jdLower.contains(n.toLowerCase()))
                    .toList();
            if (!matched.isEmpty()) {
                prioritized = matched;
            }
        }

        return joinNatural(prioritized.stream().limit(5).toList());
    }

    private String joinNatural(List<String> items) {
        if (items.isEmpty()) return "";
        if (items.size() == 1) return items.get(0);
        if (items.size() == 2) return items.get(0) + " and " + items.get(1);
        String head = String.join(", ", items.subList(0, items.size() - 1));
        return head + ", and " + items.get(items.size() - 1);
    }

    private String findBestMetricSentence(List<Experience> experience) {
        for (int i = experience.size() - 1; i >= 0; i--) {
            Experience e = experience.get(i);
            if (e.getDescription() == null || e.getDescription().isBlank()) continue;

            for (String sentence : e.getDescription().split("(?<=[.!?])\\s+")) {
                Matcher m = METRIC_PATTERN.matcher(sentence);
                if (m.find()) {
                    String clean = sentence.trim();
                    if (!clean.endsWith(".") && !clean.endsWith("!") && !clean.endsWith("?")) {
                        clean = clean + ".";
                    }
                    return capitalizeFirst(clean);
                }
            }
        }
        return null;
    }

    private String capSentenceCount(String text, int maxSentences) {
        String[] sentences = text.split("(?<=[.!?])\\s+");
        if (sentences.length <= maxSentences) return text;
        return String.join(" ", List.of(sentences).subList(0, maxSentences));
    }

    private String capitalizeFirst(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private String lowerFirst(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toLowerCase(s.charAt(0)) + s.substring(1);
    }

    private <T> List<T> safeList(List<T> list) {
        return list == null ? Collections.emptyList() : list;
    }

    private List<String> jsonArrayToStringList(JsonNode node) {
        if (node == null || !node.isArray()) return List.of();
        List<String> res = new ArrayList<>();
        for (JsonNode item : node) {
            String text = item.asText("").trim();
            if (!text.isBlank()) res.add(text);
        }
        return res;
    }
}
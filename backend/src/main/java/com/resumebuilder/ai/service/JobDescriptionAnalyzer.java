package com.resumebuilder.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.dto.JobAnalysisResponse;
import com.resumebuilder.ai.dto.MatchClassification;
import com.resumebuilder.ai.dto.SkillMatchItem;
import com.resumebuilder.ai.llm.AiGenerationRequest;
import com.resumebuilder.ai.llm.AiGenerationResponse;
import com.resumebuilder.ai.llm.LlmService;
import com.resumebuilder.ai.prompt.ResumeAiPrompts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class JobDescriptionAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(JobDescriptionAnalyzer.class);

    private static final Pattern WORD_SPLIT = Pattern.compile("[,;•\\n\\r]+");
    private static final Set<String> COMMON_TECH = Set.of(
            "java", "spring boot", "spring", "rest api", "rest apis", "restful", "postgresql", "postgres", "sql", "mysql",
            "docker", "kubernetes", "aws", "azure", "gcp", "react", "typescript", "javascript", "html", "css",
            "tailwind", "node.js", "nodejs", "python", "fastapi", "django", "git", "github", "ci/cd", "jwt",
            "microservices", "redis", "mongodb", "graphql", "hibernate", "jpa", "linux", "unit testing", "junit"
    );

    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    public JobDescriptionAnalyzer(LlmService llmService, ObjectMapper objectMapper) {
        this.llmService = llmService;
        this.objectMapper = objectMapper;
    }

    public JobAnalysisResponse analyze(String targetJobTitle, String targetJobDescription, ResumeContext candidateContext) {
        String effectiveTitle = (targetJobTitle != null && !targetJobTitle.isBlank())
                ? targetJobTitle.trim()
                : "Target Role";

        if (targetJobDescription == null || targetJobDescription.isBlank()) {
            return buildGeneralAnalysis(effectiveTitle, candidateContext);
        }

        if (llmService.isAvailable()) {
            try {
                return analyzeWithLlm(effectiveTitle, targetJobDescription, candidateContext);
            } catch (Exception ex) {
                log.warn("LLM job analysis failed, falling back to deterministic analyzer: {}", ex.getMessage());
            }
        }

        return analyzeDeterministic(effectiveTitle, targetJobDescription, candidateContext);
    }

    private JobAnalysisResponse analyzeWithLlm(String jobTitle, String jobDescription, ResumeContext candidateContext) {
        String prompt = """
                Analyze the following Job Description and compare it against the Candidate's verified resume data.
                
                TARGET JOB TITLE:
                %s
                
                JOB DESCRIPTION:
                %s
                
                CANDIDATE'S VERIFIED RESUME DATA:
                Skills: %s
                Experience: %s
                Projects: %s
                
                OUTPUT REQUIREMENTS:
                Return ONLY a JSON object with this exact schema:
                {
                  "jobTitle": "...",
                  "requiredSkills": ["skill1", "skill2"],
                  "preferredSkills": ["skill1", "skill2"],
                  "responsibilities": ["resp1", "resp2"],
                  "keywords": ["kw1", "kw2"],
                  "skillMatches": [
                    {"skill": "Java", "classification": "MATCH", "candidateContext": "Used in experience and skills"},
                    {"skill": "AWS", "classification": "MISSING", "candidateContext": "Not mentioned in resume"}
                  ],
                  "missingSkills": ["AWS"],
                  "matchScore": 75
                }
                
                CRITICAL RULES:
                - Classification must be one of: "MATCH", "PARTIAL_MATCH", "MISSING".
                - NEVER classify a skill as "MATCH" unless it is explicitly present in the candidate's verified data.
                - Match score must be an integer between 0 and 100 based on proportion of required skills matched.
                """.formatted(
                jobTitle,
                jobDescription,
                String.join(", ", candidateContext.skills()),
                candidateContext.experience().stream().map(e -> e.jobTitle() + " at " + e.company() + ": " + e.description()).collect(Collectors.joining("; ")),
                candidateContext.projects().stream().map(p -> p.title() + ": " + p.description()).collect(Collectors.joining("; "))
        );

        AiGenerationRequest req = AiGenerationRequest.builder()
                .systemInstruction(ResumeAiPrompts.SYSTEM_INSTRUCTION)
                .prompt(prompt)
                .jsonResponse()
                .temperature(0.1)
                .build();

        AiGenerationResponse res = llmService.generate(req);
        try {
            JsonNode root = objectMapper.readTree(res.text());
            String extractedTitle = root.path("jobTitle").asText(jobTitle);
            List<String> requiredSkills = jsonArrayToStringList(root.path("requiredSkills"));
            List<String> preferredSkills = jsonArrayToStringList(root.path("preferredSkills"));
            List<String> responsibilities = jsonArrayToStringList(root.path("responsibilities"));
            List<String> keywords = jsonArrayToStringList(root.path("keywords"));
            List<String> missingSkills = jsonArrayToStringList(root.path("missingSkills"));
            int score = root.path("matchScore").asInt(50);

            List<SkillMatchItem> matches = new ArrayList<>();
            JsonNode skillMatchesNode = root.path("skillMatches");
            if (skillMatchesNode.isArray()) {
                for (JsonNode item : skillMatchesNode) {
                    String skillName = item.path("skill").asText("");
                    String rawClass = item.path("classification").asText("UNKNOWN").toUpperCase();
                    MatchClassification classification = MatchClassification.UNKNOWN;
                    try {
                        classification = MatchClassification.valueOf(rawClass);
                    } catch (Exception ignored) {}
                    String ctx = item.path("candidateContext").asText("");
                    if (!skillName.isBlank()) {
                        matches.add(new SkillMatchItem(skillName, classification, ctx));
                    }
                }
            }

            return new JobAnalysisResponse(
                    extractedTitle,
                    requiredSkills,
                    preferredSkills,
                    responsibilities,
                    keywords,
                    matches,
                    missingSkills,
                    Math.max(0, Math.min(100, score))
            );
        } catch (Exception e) {
            log.warn("Failed to parse LLM JSON for job analysis, falling back to deterministic: {}", e.getMessage());
            return analyzeDeterministic(jobTitle, jobDescription, candidateContext);
        }
    }

    public JobAnalysisResponse analyzeDeterministic(String jobTitle, String jobDescription, ResumeContext candidateContext) {
        String jdLower = jobDescription.toLowerCase();
        Set<String> candidateSkillsLower = candidateContext.skills().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<String> detectedSkills = new ArrayList<>();
        for (String tech : COMMON_TECH) {
            if (jdLower.contains(tech)) {
                detectedSkills.add(tech);
            }
        }

        List<String> candidateMatched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        List<SkillMatchItem> skillMatches = new ArrayList<>();

        for (String s : candidateContext.skills()) {
            if (jdLower.contains(s.toLowerCase())) {
                candidateMatched.add(s);
                skillMatches.add(new SkillMatchItem(s, MatchClassification.MATCH, "Listed in skills section"));
            }
        }

        for (String tech : detectedSkills) {
            boolean candidateHas = candidateSkillsLower.stream().anyMatch(cs -> cs.contains(tech) || tech.contains(cs));
            if (!candidateHas) {
                String capitalized = capitalizeWords(tech);
                missing.add(capitalized);
                skillMatches.add(new SkillMatchItem(capitalized, MatchClassification.MISSING, "Required in JD, missing from candidate skills"));
            }
        }

        int totalExpected = candidateMatched.size() + missing.size();
        int score = totalExpected > 0 ? (int) Math.round(((double) candidateMatched.size() / totalExpected) * 100) : 70;

        List<String> keywords = new ArrayList<>(candidateMatched);
        keywords.addAll(detectedSkills.stream().map(this::capitalizeWords).limit(6).toList());

        return new JobAnalysisResponse(
                jobTitle,
                detectedSkills.stream().limit(5).map(this::capitalizeWords).toList(),
                detectedSkills.stream().skip(5).limit(4).map(this::capitalizeWords).toList(),
                List.of("Deliver high-quality software according to specifications", "Collaborate on development and testing"),
                keywords.stream().distinct().toList(),
                skillMatches,
                missing.stream().distinct().toList(),
                Math.max(10, Math.min(100, score))
        );
    }

    private JobAnalysisResponse buildGeneralAnalysis(String jobTitle, ResumeContext candidateContext) {
        List<SkillMatchItem> matches = candidateContext.skills().stream()
                .map(s -> new SkillMatchItem(s, MatchClassification.MATCH, "Present on resume"))
                .toList();

        return new JobAnalysisResponse(
                jobTitle,
                candidateContext.skills().stream().limit(6).toList(),
                List.of(),
                List.of("Apply core software engineering skills to project goals"),
                candidateContext.skills(),
                matches,
                List.of(),
                85
        );
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

    private String capitalizeWords(String input) {
        if (input == null || input.isBlank()) return "";
        return Arrays.stream(input.split("\\s+"))
                .map(w -> w.isEmpty() ? "" : Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .collect(Collectors.joining(" "));
    }
}

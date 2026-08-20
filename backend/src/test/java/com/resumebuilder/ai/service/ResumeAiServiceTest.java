package com.resumebuilder.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai.context.ResumeContextBuilder;
import com.resumebuilder.ai.dto.*;
import com.resumebuilder.ai.llm.LlmService;
import com.resumebuilder.ai.prompt.*;
import com.resumebuilder.resume.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ResumeAiServiceTest {

    private ResumeAiService resumeAiService;
    private LlmService mockLlmService;

    @BeforeEach
    void setUp() {
        mockLlmService = Mockito.mock(LlmService.class);
        when(mockLlmService.isAvailable()).thenReturn(false); // test deterministic mode

        ObjectMapper objectMapper = new ObjectMapper();
        ResumeContextBuilder contextBuilder = new ResumeContextBuilder();
        JobDescriptionAnalyzer jobDescriptionAnalyzer = new JobDescriptionAnalyzer(mockLlmService, objectMapper);
        MarkdownParserService markdownParserService = new MarkdownParserService();
        SummaryPromptBuilder summaryPromptBuilder = new SummaryPromptBuilder(contextBuilder);
        ExperiencePromptBuilder experiencePromptBuilder = new ExperiencePromptBuilder();
        ProjectPromptBuilder projectPromptBuilder = new ProjectPromptBuilder();
        AtsPromptBuilder atsPromptBuilder = new AtsPromptBuilder(contextBuilder);
        TailoringPromptBuilder tailoringPromptBuilder = new TailoringPromptBuilder(contextBuilder);

        resumeAiService = new ResumeAiService(
                mockLlmService,
                contextBuilder,
                jobDescriptionAnalyzer,
                markdownParserService,
                summaryPromptBuilder,
                experiencePromptBuilder,
                projectPromptBuilder,
                atsPromptBuilder,
                tailoringPromptBuilder,
                objectMapper
        );
    }

    @Test
    void testSummaryGenerationAndPreview() {
        Resume resume = new Resume();
        resume.setTitle("Java Developer Resume");

        PersonalInfo pi = new PersonalInfo();
        pi.setFullName("John Developer");
        pi.setJobTitle("Software Engineer");
        resume.setPersonalInfo(pi);

        Skill skill1 = new Skill();
        skill1.setName("Java");
        Skill skill2 = new Skill();
        skill2.setName("Spring Boot");
        resume.setSkillList(new ArrayList<>(List.of(skill1, skill2)));

        AiSummaryPreviewResponse preview = resumeAiService.generateSummaryPreview(
                resume, "Java Backend Engineer", "We need Java and Spring Boot experience."
        );

        assertNotNull(preview);
        assertNotNull(preview.summary());
        assertFalse(preview.summary().isBlank());
        assertTrue(preview.summary().toLowerCase().contains("java") || preview.summary().toLowerCase().contains("spring"));
    }

    @Test
    void testExperienceBulletGeneration() {
        AiExperienceResponse response = resumeAiService.generateExperienceBullets(
                UUID.randomUUID(),
                "Tech Corp",
                "Backend Engineer",
                "Worked on REST APIs and optimized SQL queries.",
                List.of("Java", "Spring Boot"),
                "Java Engineer",
                "Java and SQL needed"
        );

        assertNotNull(response);
        assertFalse(response.bullets().isEmpty());
    }

    @Test
    void testProjectBulletGenerationWithReadme() {
        String readme = """
                # Payment Gateway
                ## Technologies
                - Java 21
                - Spring Boot
                - Stripe API
                ## Features
                - Secure webhook processing
                """;

        AiProjectResponse response = resumeAiService.generateProjectBullets(
                UUID.randomUUID(),
                "Payment Gateway",
                "Payment processing system",
                readme,
                List.of("Java", "Spring Boot"),
                "Backend Developer",
                "Payment systems experience"
        );

        assertNotNull(response);
        assertFalse(response.bullets().isEmpty());
        assertFalse(response.extractedTech().isEmpty());
    }

    @Test
    void testSkillPrioritization() {
        Resume resume = new Resume();
        Skill s1 = new Skill(); s1.setName("React");
        Skill s2 = new Skill(); s2.setName("Java");
        Skill s3 = new Skill(); s3.setName("Spring Boot");
        resume.setSkillList(new ArrayList<>(List.of(s1, s2, s3)));

        SkillPrioritizationResponse response = resumeAiService.prioritizeSkills(
                resume, "Java Backend Developer", "Java, Spring Boot, PostgreSQL"
        );

        assertNotNull(response);
        assertEquals(3, response.prioritizedSkills().size());
        // Java and Spring Boot should be prioritized before React
        int javaIdx = response.prioritizedSkills().indexOf("Java");
        int reactIdx = response.prioritizedSkills().indexOf("React");
        assertTrue(javaIdx < reactIdx);
    }
}

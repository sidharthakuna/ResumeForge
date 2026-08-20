package com.resumebuilder.ai.prompt;

import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.context.ResumeContextBuilder;
import com.resumebuilder.ai.dto.JobAnalysisResponse;
import com.resumebuilder.ai.dto.ParseMarkdownResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PromptBuildersTest {

    private ResumeContextBuilder contextBuilder;
    private SummaryPromptBuilder summaryPromptBuilder;
    private ExperiencePromptBuilder experiencePromptBuilder;
    private ProjectPromptBuilder projectPromptBuilder;
    private AtsPromptBuilder atsPromptBuilder;
    private TailoringPromptBuilder tailoringPromptBuilder;

    @BeforeEach
    void setUp() {
        contextBuilder = new ResumeContextBuilder();
        summaryPromptBuilder = new SummaryPromptBuilder(contextBuilder);
        experiencePromptBuilder = new ExperiencePromptBuilder();
        projectPromptBuilder = new ProjectPromptBuilder();
        atsPromptBuilder = new AtsPromptBuilder(contextBuilder);
        tailoringPromptBuilder = new TailoringPromptBuilder(contextBuilder);
    }

    @Test
    void testSummaryPromptBuilder() {
        ResumeContext ctx = new ResumeContext(
                UUID.randomUUID(),
                "Full Stack Resume",
                new ResumeContext.PersonalInfoContext("Jane Doe", "Full Stack Developer", "NYC", "jane@example.com", null, null),
                List.of(),
                List.of(),
                List.of(),
                List.of("Java", "React", "PostgreSQL"),
                List.of(),
                List.of(),
                List.of(),
                null,
                null,
                null
        );

        JobAnalysisResponse analysis = new JobAnalysisResponse(
                "Full Stack Developer",
                List.of("Java", "React"),
                List.of("AWS"),
                List.of(),
                List.of("Java", "React"),
                List.of(),
                List.of("AWS"),
                75
        );

        String prompt = summaryPromptBuilder.buildPrompt(ctx, "Full Stack Developer", "Need Java and React experience.", analysis);
        assertNotNull(prompt);
        assertTrue(prompt.contains("Jane Doe"));
        assertTrue(prompt.contains("Full Stack Developer"));
        assertTrue(prompt.contains("OUTPUT FORMAT"));
        assertTrue(prompt.contains("matchedSkills"));
    }

    @Test
    void testExperiencePromptBuilder() {
        String prompt = experiencePromptBuilder.buildPrompt(
                "Acme Corp",
                "Senior Engineer",
                "Built backend APIs and handled databases. Improved query response time by 30%.",
                List.of("Java", "Spring Boot", "PostgreSQL"),
                "Backend Engineer",
                "Looking for Spring Boot and PostgreSQL experience."
        );

        assertNotNull(prompt);
        assertTrue(prompt.contains("Acme Corp"));
        assertTrue(prompt.contains("30%"));
        assertTrue(prompt.contains("bullets"));
    }

    @Test
    void testProjectPromptBuilderWithParsedReadme() {
        ParseMarkdownResponse readme = new ParseMarkdownResponse(
                "ResumeForge",
                "AI resume builder",
                List.of("Java 21", "Spring Boot", "React"),
                List.of("Real-time preview"),
                List.of("REST API architecture"),
                List.of("PostgreSQL with Flyway")
        );

        String prompt = projectPromptBuilder.buildPrompt(
                "ResumeForge",
                "Full-stack resume application",
                readme,
                List.of("Java", "React"),
                "Full Stack Engineer",
                "Looking for Java and React full stack experience."
        );

        assertNotNull(prompt);
        assertTrue(prompt.contains("ResumeForge"));
        assertTrue(prompt.contains("Java 21"));
        assertTrue(prompt.contains("extractedTech"));
    }

    @Test
    void testAtsAndTailoringPromptBuilders() {
        ResumeContext ctx = new ResumeContext(
                UUID.randomUUID(),
                "Backend Resume",
                new ResumeContext.PersonalInfoContext("John", "Backend Dev", "Dallas", "john@example.com", null, null),
                List.of(),
                List.of(),
                List.of(),
                List.of("Java", "Spring Boot", "Docker"),
                List.of(),
                List.of(),
                List.of(),
                null,
                null,
                null
        );

        String atsPrompt = atsPromptBuilder.buildPrompt(ctx, "Java Developer", "Java, Spring Boot, AWS");
        assertNotNull(atsPrompt);
        assertTrue(atsPrompt.contains("score"));

        String tailorPrompt = tailoringPromptBuilder.buildPrompt(ctx, "Java Developer", "Java, Spring Boot, Docker");
        assertNotNull(tailorPrompt);
        assertTrue(tailorPrompt.contains("prioritizedSkills"));
    }
}

package com.resumebuilder.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.dto.JobAnalysisResponse;
import com.resumebuilder.ai.dto.MatchClassification;
import com.resumebuilder.ai.llm.LlmService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class JobDescriptionAnalyzerTest {

    private JobDescriptionAnalyzer analyzer;
    private LlmService mockLlmService;

    @BeforeEach
    void setUp() {
        mockLlmService = Mockito.mock(LlmService.class);
        when(mockLlmService.isAvailable()).thenReturn(false); // test deterministic fallback
        analyzer = new JobDescriptionAnalyzer(mockLlmService, new ObjectMapper());
    }

    @Test
    void testDeterministicAnalysisWithMatchingAndMissingSkills() {
        ResumeContext ctx = new ResumeContext(
                UUID.randomUUID(),
                "Software Engineer",
                new ResumeContext.PersonalInfoContext("Alex Doe", "Backend Developer", "Seattle", "alex@example.com", null, null),
                List.of(),
                List.of(),
                List.of(),
                List.of("Java", "Spring Boot", "PostgreSQL", "Docker"),
                List.of(),
                List.of(),
                List.of(),
                "Strong backend foundations",
                "",
                ""
        );

        String jd = """
                We are looking for a Java Backend Developer.
                Requirements:
                - Strong Java and Spring Boot experience.
                - PostgreSQL database design and SQL.
                - Experience with AWS and Kubernetes cloud infrastructure.
                - Docker containerization.
                """;

        JobAnalysisResponse res = analyzer.analyze("Java Backend Developer", jd, ctx);

        assertNotNull(res);
        assertEquals("Java Backend Developer", res.jobTitle());
        assertTrue(res.matchScore() > 0 && res.matchScore() <= 100);

        // Check matched skills
        assertTrue(res.skillMatches().stream().anyMatch(m -> m.classification() == MatchClassification.MATCH && m.skill().equalsIgnoreCase("Java")));
        assertTrue(res.skillMatches().stream().anyMatch(m -> m.classification() == MatchClassification.MATCH && m.skill().equalsIgnoreCase("Spring Boot")));

        // Check missing skills
        assertTrue(res.missingSkills().stream().anyMatch(m -> m.equalsIgnoreCase("AWS")));
        assertTrue(res.missingSkills().stream().anyMatch(m -> m.equalsIgnoreCase("Kubernetes")));
    }
}

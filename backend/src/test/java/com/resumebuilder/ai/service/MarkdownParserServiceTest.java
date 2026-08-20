package com.resumebuilder.ai.service;

import com.resumebuilder.ai.dto.ParseMarkdownResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MarkdownParserServiceTest {

    private MarkdownParserService markdownParserService;

    @BeforeEach
    void setUp() {
        markdownParserService = new MarkdownParserService();
    }

    @Test
    void testParseEmptyOrNullMarkdown() {
        ParseMarkdownResponse res1 = markdownParserService.parse(null);
        assertNotNull(res1);
        assertEquals("", res1.projectName());

        ParseMarkdownResponse res2 = markdownParserService.parse("   ");
        assertNotNull(res2);
        assertEquals("", res2.projectName());
    }

    @Test
    void testParseRichProjectReadme() {
        String markdown = """
                # ResumeForge Platform
                
                [![Build Status](https://example.com/badge.svg)](https://example.com)
                
                ResumeForge is an intelligent full-stack resume builder designed to optimize technical resumes for modern ATS systems.
                
                ## Technologies
                - Java 21
                - Spring Boot 3.4
                - PostgreSQL
                - Docker
                - React & TypeScript
                
                ## Key Features
                - Real-time PDF preview and generation
                - Job description keyword tailoring
                - Multi-template export
                
                ## Architecture
                - RESTful micro-architecture with stateless JWT authentication
                - Bucket4j rate limiting
                
                ## APIs & Database
                - PostgreSQL relational schema with Flyway migrations
                - S3 and local storage providers
                """;

        ParseMarkdownResponse res = markdownParserService.parse(markdown);

        assertNotNull(res);
        assertTrue(res.projectName().contains("ResumeForge Platform"));
        assertTrue(res.summary().contains("ResumeForge is an intelligent"));
        assertFalse(res.technologies().isEmpty());
        assertTrue(res.technologies().stream().anyMatch(t -> t.contains("Java 21") || t.contains("Spring Boot")));
        assertFalse(res.keyFeatures().isEmpty());
        assertTrue(res.keyFeatures().stream().anyMatch(f -> f.contains("PDF preview")));
        assertFalse(res.architecturePoints().isEmpty());
        assertFalse(res.databaseAndApis().isEmpty());
    }
}

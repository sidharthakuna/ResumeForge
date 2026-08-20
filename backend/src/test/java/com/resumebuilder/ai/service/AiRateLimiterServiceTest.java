package com.resumebuilder.ai.service;

import com.resumebuilder.ai.config.AiProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AiRateLimiterServiceTest {

    private AiRateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        AiProperties properties = new AiProperties();
        properties.getRateLimit().setCapacity(3);
        properties.getRateLimit().setRefillHours(1);
        rateLimiterService = new AiRateLimiterService(properties);
    }

    @Test
    void testUnlimitedGeneration() {
        UUID userId = UUID.randomUUID();

        for (int i = 0; i < 50; i++) {
            assertTrue(rateLimiterService.tryConsume(userId));
        }
        assertEquals(Long.MAX_VALUE, rateLimiterService.availableTokens(userId));

        UUID anotherUser = UUID.randomUUID();
        assertTrue(rateLimiterService.tryConsume(anotherUser));
    }
}

package com.resumebuilder.ai.service;

import com.resumebuilder.ai.config.AiProperties;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for Gemini AI generation rate limits.
 * Rate limiting has been removed to permit unlimited Gemini API generations.
 */
@Service
public class AiRateLimiterService {

    @SuppressWarnings("unused")
    private final AiProperties aiProperties;

    public AiRateLimiterService(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    /**
     * Attempts to consume one token from the user's bucket.
     * Unlimited AI generation is permitted: always returns true.
     * @return true always (unlimited).
     */
    public boolean tryConsume(UUID userId) {
        return true;
    }

    /** Tokens remaining right now (unlimited). */
    public long availableTokens(UUID userId) {
        return Long.MAX_VALUE;
    }
}
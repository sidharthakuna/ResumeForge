package com.resumebuilder.common.exception;

/**
 * Wraps any failure from the AI provider call (timeout, malformed response,
 * quota/billing error, network failure) so it's distinguishable from a bug
 * in our own code. Thrown by ResumeAiService, caught by
 * GlobalExceptionHandler and surfaced as 502.
 */
public class AiGenerationException extends RuntimeException {
    public AiGenerationException(String message) {
        super(message);
    }

    public AiGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
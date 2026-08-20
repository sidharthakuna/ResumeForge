package com.resumebuilder.ai.llm;

public record AiGenerationResponse(
        String text,
        String finishReason,
        Integer promptTokens,
        Integer candidateTokens
) {
    public static AiGenerationResponse of(String text) {
        return new AiGenerationResponse(text, "STOP", 0, 0);
    }
}

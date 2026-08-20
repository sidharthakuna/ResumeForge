package com.resumebuilder.ai.llm;

public interface LlmService {

    /**
     * Executes generation against the underlying LLM provider.
     *
     * @param request the generation parameters and prompts
     * @return structured LLM generation response
     */
    AiGenerationResponse generate(AiGenerationRequest request);

    /**
     * Checks if the LLM service is enabled and configured with necessary credentials.
     *
     * @return true if operational
     */
    boolean isAvailable();
}

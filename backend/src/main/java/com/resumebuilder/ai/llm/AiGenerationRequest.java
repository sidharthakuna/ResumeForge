package com.resumebuilder.ai.llm;

public record AiGenerationRequest(
        String systemInstruction,
        String prompt,
        Double temperature,
        String responseMimeType,
        Integer maxOutputTokens
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String systemInstruction;
        private String prompt;
        private Double temperature = 0.2;
        private String responseMimeType;
        private Integer maxOutputTokens = 2048;

        public Builder systemInstruction(String systemInstruction) {
            this.systemInstruction = systemInstruction;
            return this;
        }

        public Builder prompt(String prompt) {
            this.prompt = prompt;
            return this;
        }

        public Builder temperature(Double temperature) {
            this.temperature = temperature;
            return this;
        }

        public Builder responseMimeType(String responseMimeType) {
            this.responseMimeType = responseMimeType;
            return this;
        }

        public Builder jsonResponse() {
            this.responseMimeType = "application/json";
            return this;
        }

        public Builder maxOutputTokens(Integer maxOutputTokens) {
            this.maxOutputTokens = maxOutputTokens;
            return this;
        }

        public AiGenerationRequest build() {
            return new AiGenerationRequest(systemInstruction, prompt, temperature, responseMimeType, maxOutputTokens);
        }
    }
}

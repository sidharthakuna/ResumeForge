package com.resumebuilder.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ai")
public class AiProperties {

    private boolean enabled = true;
    private Gemini gemini = new Gemini();
    private RateLimit rateLimit = new RateLimit();

    public static class Gemini {
        private String apiKey = "";
        private String model = "gemini-1.5-flash";
        private String baseUrl = "https://generativelanguage.googleapis.com";
        private int timeoutMs = 30000;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey != null ? apiKey.trim() : "";
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model != null && !model.isBlank() ? model.trim() : "gemini-1.5-flash";
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl != null && !baseUrl.isBlank() ? baseUrl.trim() : "https://generativelanguage.googleapis.com";
        }

        public int getTimeoutMs() {
            return timeoutMs > 0 ? timeoutMs : 30000;
        }

        public void setTimeoutMs(int timeoutMs) {
            this.timeoutMs = timeoutMs;
        }
    }

    public static class RateLimit {
        private int capacity = 10;
        private int refillHours = 1;

        public int getCapacity() {
            return capacity > 0 ? capacity : 10;
        }

        public void setCapacity(int capacity) {
            this.capacity = capacity;
        }

        public int getRefillHours() {
            return refillHours > 0 ? refillHours : 1;
        }

        public void setRefillHours(int refillHours) {
            this.refillHours = refillHours;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Gemini getGemini() {
        return gemini;
    }

    public void setGemini(Gemini gemini) {
        this.gemini = gemini;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(RateLimit rateLimit) {
        this.rateLimit = rateLimit;
    }
}

package com.resumebuilder.generation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class GenerateResumeResponse {

    private UUID generatedResumeId;
    private String downloadUrl;
    private LocalDateTime generatedAt;

    public GenerateResumeResponse() {}

    public GenerateResumeResponse(UUID generatedResumeId, String downloadUrl, LocalDateTime generatedAt) {
        this.generatedResumeId = generatedResumeId;
        this.downloadUrl = downloadUrl;
        this.generatedAt = generatedAt;
    }

    public UUID getGeneratedResumeId() { return generatedResumeId; }
    public void setGeneratedResumeId(UUID generatedResumeId) { this.generatedResumeId = generatedResumeId; }
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
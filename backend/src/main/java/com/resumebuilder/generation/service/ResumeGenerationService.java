package com.resumebuilder.generation.service;

import com.resumebuilder.generation.dto.DownloadedFile;
import com.resumebuilder.generation.dto.GenerateFromHtmlRequest;
import com.resumebuilder.generation.dto.GenerateResumeResponse;
import com.resumebuilder.generation.dto.GeneratedResumeSummary;
import com.resumebuilder.template.ResumeTemplate;

import java.util.List;
import java.util.UUID;

public interface ResumeGenerationService {

    GenerateResumeResponse generate(UUID resumeId, ResumeTemplate template);

    GenerateResumeResponse generateFromHtml(UUID resumeId, GenerateFromHtmlRequest request);

    String preview(UUID resumeId, ResumeTemplate template);

    DownloadedFile download(UUID generatedResumeId);

    void delete(UUID generatedResumeId);

    List<GeneratedResumeSummary> listForResume(UUID resumeId);
}
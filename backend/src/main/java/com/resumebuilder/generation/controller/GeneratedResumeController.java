package com.resumebuilder.generation.controller;

import com.resumebuilder.common.response.ApiResponse;
import com.resumebuilder.generation.dto.DownloadedFile;
import com.resumebuilder.generation.dto.GeneratedResumeSummary;
import com.resumebuilder.generation.service.ResumeGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/generated-resumes")
@RequiredArgsConstructor
public class GeneratedResumeController {

    private final ResumeGenerationService resumeGenerationService;

    @GetMapping("/{generatedResumeId}/download")
    public ResponseEntity<Resource> downloadGeneratedResume(
            @PathVariable UUID generatedResumeId
    ) {

        DownloadedFile downloadedFile =
                resumeGenerationService.download(generatedResumeId);

        ByteArrayResource resource =
                new ByteArrayResource(downloadedFile.bytes());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + downloadedFile.fileName() + "\""
                )
                .contentLength(downloadedFile.bytes().length)
                .body(resource);
    }

    // Scoped to a specific resume's history. Note: this endpoint lives
    // under /api/generated-resumes (this controller's base path) rather
    // than /api/resumes, because putting it here avoids splitting the
    // GeneratedResume concern across two controllers. The path is
    // /api/generated-resumes/by-resume/{resumeId}.
    @GetMapping("/by-resume/{resumeId}")
    public ApiResponse<List<GeneratedResumeSummary>> listForResume(
            @PathVariable UUID resumeId
    ) {
        return ApiResponse.success(resumeGenerationService.listForResume(resumeId));
    }

    @DeleteMapping("/{generatedResumeId}")
    public ApiResponse<Void> deleteGeneratedResume(
            @PathVariable UUID generatedResumeId
    ) {
        resumeGenerationService.delete(generatedResumeId);
        return ApiResponse.success(null);
    }
}
package com.resumebuilder.generation.controller;

import com.resumebuilder.common.response.ApiResponse;
import com.resumebuilder.generation.dto.GenerateFromHtmlRequest;
import com.resumebuilder.generation.dto.GenerateResumeResponse;
import com.resumebuilder.generation.service.ResumeGenerationService;
import com.resumebuilder.template.dto.TemplateSelectionRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeGenerationController {

    private final ResumeGenerationService resumeGenerationService;

    @PostMapping("/{resumeId}/generate")
    public ApiResponse<GenerateResumeResponse> generateResume(
            @PathVariable UUID resumeId,
            @Valid @RequestBody TemplateSelectionRequest request
    ) {

        GenerateResumeResponse response =
                resumeGenerationService.generate(resumeId, request.template());

        return ApiResponse.success(response);
    }

    @PostMapping("/{resumeId}/generate-from-html")
    public ApiResponse<GenerateResumeResponse> generateFromHtml(
            @PathVariable UUID resumeId,
            @Valid @RequestBody GenerateFromHtmlRequest request
    ) {

        GenerateResumeResponse response =
                resumeGenerationService.generateFromHtml(resumeId, request);

        return ApiResponse.success(response);
    }

    @GetMapping("/{resumeId}/preview")
    public ApiResponse<String> previewResume(
            @PathVariable UUID resumeId,
            @RequestParam(required = false, defaultValue = "MODERN") com.resumebuilder.template.ResumeTemplate template
    ) {
        String html = resumeGenerationService.preview(resumeId, template);
        return ApiResponse.success(html);
    }
}
package com.resumebuilder.ai.controller;

import com.resumebuilder.ai.context.ResumeContext;
import com.resumebuilder.ai.context.ResumeContextBuilder;
import com.resumebuilder.ai.dto.*;
import com.resumebuilder.ai.service.AiRateLimiterService;
import com.resumebuilder.ai.service.JobDescriptionAnalyzer;
import com.resumebuilder.ai.service.ResumeAiService;
import com.resumebuilder.common.exception.RateLimitExceededException;
import com.resumebuilder.common.exception.ResourceNotFoundException;
import com.resumebuilder.common.response.ApiResponse;
import com.resumebuilder.common.security.AuthenticationFacade;
import com.resumebuilder.resume.entity.Resume;
import com.resumebuilder.resume.repository.ResumeRepository;
import com.resumebuilder.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class AiController {

    private final ResumeAiService resumeAiService;
    private final JobDescriptionAnalyzer jobDescriptionAnalyzer;
    private final ResumeContextBuilder resumeContextBuilder;
    private final AiRateLimiterService aiRateLimiterService;
    private final AuthenticationFacade authenticationFacade;
    private final ResumeRepository resumeRepository;

    public AiController(
            ResumeAiService resumeAiService,
            JobDescriptionAnalyzer jobDescriptionAnalyzer,
            ResumeContextBuilder resumeContextBuilder,
            AiRateLimiterService aiRateLimiterService,
            AuthenticationFacade authenticationFacade,
            ResumeRepository resumeRepository
    ) {
        this.resumeAiService = resumeAiService;
        this.jobDescriptionAnalyzer = jobDescriptionAnalyzer;
        this.resumeContextBuilder = resumeContextBuilder;
        this.aiRateLimiterService = aiRateLimiterService;
        this.authenticationFacade = authenticationFacade;
        this.resumeRepository = resumeRepository;
    }

    @PostMapping("/api/resumes/{resumeId}/ai/analyze-job")
    public ResponseEntity<ApiResponse<JobAnalysisResponse>> analyzeJob(
            @PathVariable UUID resumeId,
            @Valid @RequestBody JobAnalysisRequest request
    ) {
        Resume resume = getAuthenticatedResume(resumeId);
        consumeRateLimit();

        ResumeContext ctx = resumeContextBuilder.build(resume);
        JobAnalysisResponse analysisResponse = jobDescriptionAnalyzer.analyze(
                request.targetJobTitle(), request.targetJobDescription(), ctx
        );

        return ResponseEntity.ok(ApiResponse.success(analysisResponse));
    }

    @PostMapping("/api/resumes/{resumeId}/ai/generate-summary")
    public ResponseEntity<ApiResponse<AiSummaryPreviewResponse>> previewSummary(
            @PathVariable UUID resumeId,
            @Valid @RequestBody GenerateSummaryRequest request
    ) {
        Resume resume = getAuthenticatedResume(resumeId);
        consumeRateLimit();

        AiSummaryPreviewResponse response = resumeAiService.generateSummaryPreview(
                resume, request.targetJobTitle(), request.targetJobDescription()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/resumes/{resumeId}/ai/generate-experience")
    public ResponseEntity<ApiResponse<AiExperienceResponse>> generateExperience(
            @PathVariable UUID resumeId,
            @Valid @RequestBody AiExperienceRequest request
    ) {
        Resume resume = getAuthenticatedResume(resumeId);
        consumeRateLimit();

        List<String> skills = resume.getSkillList() != null
                ? resume.getSkillList().stream()
                .map(s -> s.getName())
                .filter(n -> n != null && !n.isBlank())
                .toList()
                : List.of();

        AiExperienceResponse response = resumeAiService.generateExperienceBullets(
                request.experienceId(),
                request.company(),
                request.jobTitle(),
                request.currentDescription(),
                skills,
                request.targetJobTitle(),
                request.targetJobDescription()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/resumes/{resumeId}/ai/generate-project")
    public ResponseEntity<ApiResponse<AiProjectResponse>> generateProject(
            @PathVariable UUID resumeId,
            @Valid @RequestBody AiProjectRequest request
    ) {
        Resume resume = getAuthenticatedResume(resumeId);
        consumeRateLimit();

        List<String> skills = resume.getSkillList() != null
                ? resume.getSkillList().stream()
                .map(s -> s.getName())
                .filter(n -> n != null && !n.isBlank())
                .toList()
                : List.of();

        AiProjectResponse response = resumeAiService.generateProjectBullets(
                request.projectId(),
                request.title(),
                request.currentDescription(),
                request.readmeContent(),
                skills,
                request.targetJobTitle(),
                request.targetJobDescription()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/resumes/{resumeId}/ai/prioritize-skills")
    public ResponseEntity<ApiResponse<SkillPrioritizationResponse>> prioritizeSkills(
            @PathVariable UUID resumeId,
            @Valid @RequestBody SkillPrioritizationRequest request
    ) {
        Resume resume = getAuthenticatedResume(resumeId);
        consumeRateLimit();

        SkillPrioritizationResponse response = resumeAiService.prioritizeSkills(
                resume, request.targetJobTitle(), request.targetJobDescription()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/resumes/{resumeId}/ai/ats-check")
    public ResponseEntity<ApiResponse<AtsAnalysisResponse>> analyzeAts(
            @PathVariable UUID resumeId,
            @Valid @RequestBody AtsAnalysisRequest request
    ) {
        Resume resume = getAuthenticatedResume(resumeId);
        consumeRateLimit();

        AtsAnalysisResponse response = resumeAiService.analyzeAts(
                resume, request.targetJobTitle(), request.targetJobDescription()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/resumes/{resumeId}/ai/tailor")
    public ResponseEntity<ApiResponse<ResumeTailoringResponse>> tailorResume(
            @PathVariable UUID resumeId,
            @Valid @RequestBody ResumeTailoringRequest request
    ) {
        Resume resume = getAuthenticatedResume(resumeId);
        consumeRateLimit();

        ResumeTailoringResponse response = resumeAiService.tailorResume(
                resume, request.targetJobTitle(), request.targetJobDescription()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/ai/parse-markdown")
    public ResponseEntity<ApiResponse<ParseMarkdownResponse>> parseMarkdown(
            @Valid @RequestBody ParseMarkdownRequest request
    ) {
        consumeRateLimit();
        ParseMarkdownResponse response = resumeAiService.parseMarkdown(request.markdownContent());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private Resume getAuthenticatedResume(UUID resumeId) {
        User currentUser = authenticationFacade.getCurrentUser();
        return resumeRepository.findFullByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
    }

    private void consumeRateLimit() {
        User currentUser = authenticationFacade.getCurrentUser();
        if (!aiRateLimiterService.tryConsume(currentUser.getId())) {
            throw new RateLimitExceededException("You've reached the AI generation limit. Please try again later.");
        }
    }
}

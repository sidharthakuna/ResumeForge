package com.resumebuilder.resume.controller;

import com.resumebuilder.ai.dto.GenerateDeclarationRequest;
import com.resumebuilder.ai.dto.GenerateSummaryRequest;
import com.resumebuilder.common.response.ApiResponse;
import com.resumebuilder.resume.dto.request.*;
import com.resumebuilder.resume.dto.response.*;
import com.resumebuilder.resume.service.ResumeService;
import com.resumebuilder.template.ResumeTemplate;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;


    @PostMapping
    public ResponseEntity<ApiResponse<ResumeResponse>> create(
            @RequestBody CreateResumeRequest request) {

        ResumeResponse response = resumeService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    // Lists the current user's resumes, paginated. Default page size is
    // 20; 100 max to prevent a client requesting an unbounded page. Sorted
    // by updatedAt descending by default (most recently edited first) --
    // the conventional "recent" ordering for a document list.
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ResumeSummaryResponse>>> listResumes(
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        int size = Math.min(pageable.getPageSize(), 100);
        Pageable bounded = PageRequest.of(pageable.getPageNumber(), size, pageable.getSort());

        Page<ResumeSummaryResponse> response = resumeService.listResumes(bounded);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> findById(
            @PathVariable UUID id) {

        ResumeResponse response = resumeService.findById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> update(
            @PathVariable UUID id,
            @RequestBody UpdateResumeRequest request) {

        ResumeResponse response = resumeService.update(id, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{resumeId}/education")
    public ResponseEntity<ApiResponse<EducationResponse>> addEducation(
            @PathVariable UUID resumeId,
            @Valid @RequestBody EducationRequest request
    ){
        EducationResponse response = resumeService.addEducation(resumeId,request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/{resumeId}/experience")
    public ResponseEntity<ApiResponse<ExperienceResponse>> addExperience(
            @PathVariable UUID resumeId,
            @Valid @RequestBody ExperienceRequest request
    ){
        ExperienceResponse response = resumeService.addExperience(resumeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/{resumeId}/projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> addProject(
            @PathVariable UUID resumeId,
            @Valid @RequestBody ProjectRequest request
    ){
        ProjectResponse response = resumeService.addProject(resumeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }


    @PostMapping("/{resumeId}/skills")
    public ResponseEntity<ApiResponse<SkillResponse>> addSkill(
            @PathVariable UUID resumeId,
            @Valid @RequestBody SkillRequest request
    ){
        SkillResponse response = resumeService.addSkill(resumeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/{resumeId}/personal-info")
    public ResponseEntity<ApiResponse<PersonalInfoResponse>> addPersonalInfo(
            @PathVariable UUID resumeId,
            @Valid @RequestBody PersonalInfoRequest request
    ){
        PersonalInfoResponse response = resumeService.addPersonalInfo(resumeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }


    @GetMapping("/{resumeId}/preview-html")
    public ResponseEntity<String> previewHtml(
            @PathVariable UUID resumeId,
            @RequestParam(defaultValue = "MODERN") ResumeTemplate template) {
        String html = resumeService.renderTemplate(resumeId, template);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    @GetMapping("/{resumeId}/full")
    public ResponseEntity<ApiResponse<FullResumeResponse>> findFullById(
            @PathVariable UUID resumeId) {

        FullResumeResponse response = resumeService.findFullById(resumeId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping("/{resumeId}/preview-pdf")
    public ResponseEntity<byte[]> previewPdf(
            @PathVariable UUID resumeId,
            @RequestParam(defaultValue = "MODERN") ResumeTemplate template) {
        byte[] pdfBytes = resumeService.generatePdfPreview(resumeId, template);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PutMapping("/education/{educationId}")
    public ResponseEntity<ApiResponse<EducationResponse>> updateEducation(
            @PathVariable UUID educationId,
            @Valid @RequestBody EducationRequest request
    ) {

        EducationResponse response = resumeService.updateEducation(educationId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/education/{educationId}")
    public ApiResponse<Void> deleteEducation(@PathVariable UUID educationId) {
        resumeService.deleteEducation(educationId);
        return ApiResponse.success(null);
    }

    @PutMapping("/experience/{experienceId}")
    public ResponseEntity<ApiResponse<ExperienceResponse>> updateExperience(
            @PathVariable UUID experienceId,
            @Valid @RequestBody ExperienceRequest request
    ) {

        ExperienceResponse response =
                resumeService.updateExperience(experienceId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    //delete expereience
    @DeleteMapping("/experience/{experienceId}")
    public ApiResponse<Void> deleteExperience(
            @PathVariable UUID experienceId) {

        resumeService.deleteExperience(experienceId);

        return ApiResponse.success(null);
    }


    @PutMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectRequest request) {

        ProjectResponse response =
                resumeService.updateProject(projectId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/projects/{projectId}")
    public ApiResponse<Void> deleteProject(
            @PathVariable UUID projectId) {

        resumeService.deleteProject(projectId);

        return ApiResponse.success(null);
    }

    @PutMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse<SkillResponse>> updateSkill(
            @PathVariable UUID skillId,
            @Valid @RequestBody SkillRequest request) {

        SkillResponse response =
                resumeService.updateSkill(skillId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/skills/{skillId}")
    public ApiResponse<Void> deleteSkill(
            @PathVariable UUID skillId) {

        resumeService.deleteSkill(skillId);

        return ApiResponse.success(null);
    }


    @PutMapping("/personal-info/{personalInfoId}")
    public ResponseEntity<ApiResponse<PersonalInfoResponse>> updatePersonalInfo(
            @PathVariable UUID personalInfoId,
            @Valid @RequestBody PersonalInfoRequest request) {

        PersonalInfoResponse response =
                resumeService.updatePersonalInfo(personalInfoId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable UUID resumeId) {

        resumeService.deleteResume(resumeId);

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{resumeId}/certifications")
    public ResponseEntity<ApiResponse<CertificationResponse>> addCertification(
            @PathVariable UUID resumeId,
            @Valid @RequestBody CertificationRequest request
    ){
        CertificationResponse response = resumeService.addCertification(resumeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PutMapping("/certifications/{certificationId}")
    public ResponseEntity<ApiResponse<CertificationResponse>> updateCertification(
            @PathVariable UUID certificationId,
            @Valid @RequestBody CertificationRequest request) {

        CertificationResponse response =
                resumeService.updateCertification(certificationId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/certifications/{certificationId}")
    public ApiResponse<Void> deleteCertification(
            @PathVariable UUID certificationId) {

        resumeService.deleteCertification(certificationId);

        return ApiResponse.success(null);
    }

    @PostMapping("/{resumeId}/achievements")
    public ResponseEntity<ApiResponse<AchievementResponse>> addAchievement(
            @PathVariable UUID resumeId,
            @Valid @RequestBody AchievementRequest request
    ){
        AchievementResponse response = resumeService.addAchievement(resumeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PutMapping("/achievements/{achievementId}")
    public ResponseEntity<ApiResponse<AchievementResponse>> updateAchievement(
            @PathVariable UUID achievementId,
            @Valid @RequestBody AchievementRequest request) {

        AchievementResponse response =
                resumeService.updateAchievement(achievementId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/achievements/{achievementId}")
    public ApiResponse<Void> deleteAchievement(
            @PathVariable UUID achievementId) {

        resumeService.deleteAchievement(achievementId);

        return ApiResponse.success(null);
    }

    @PostMapping("/{resumeId}/languages")
    public ResponseEntity<ApiResponse<LanguageResponse>> addLanguage(
            @PathVariable UUID resumeId,
            @Valid @RequestBody LanguageRequest request
    ){
        LanguageResponse response = resumeService.addLanguage(resumeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PutMapping("/languages/{languageId}")
    public ResponseEntity<ApiResponse<LanguageResponse>> updateLanguage(
            @PathVariable UUID languageId,
            @Valid @RequestBody LanguageRequest request) {

        LanguageResponse response =
                resumeService.updateLanguage(languageId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/languages/{languageId}")
    public ApiResponse<Void> deleteLanguage(
            @PathVariable UUID languageId) {

        resumeService.deleteLanguage(languageId);

        return ApiResponse.success(null);
    }

    @PostMapping("/{resumeId}/generate-summary")
    public ResponseEntity<ApiResponse<ResumeResponse>> generateSummary(
            @PathVariable UUID resumeId,
            @RequestBody GenerateSummaryRequest request) {
        ResumeResponse response = resumeService.generateSummary(resumeId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{resumeId}/generate-declaration")
    public ResponseEntity<ApiResponse<ResumeResponse>> generateDeclaration(
            @PathVariable UUID resumeId,
            @RequestBody GenerateDeclarationRequest request) {
        ResumeResponse response = resumeService.generateDeclaration(resumeId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
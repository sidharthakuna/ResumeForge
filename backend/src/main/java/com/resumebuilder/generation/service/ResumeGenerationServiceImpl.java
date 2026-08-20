package com.resumebuilder.generation.service;

import com.resumebuilder.common.exception.ResourceNotFoundException;
import com.resumebuilder.common.security.AuthenticationFacade;
import com.resumebuilder.generation.dto.GenerateFromHtmlRequest;
import com.resumebuilder.generation.dto.GenerateResumeResponse;
import com.resumebuilder.generation.dto.GeneratedResumeSummary;
import com.resumebuilder.generation.entity.GeneratedResume;
import com.resumebuilder.template.ResumeTemplate;
import com.resumebuilder.generation.repository.GeneratedResumeRepository;
import com.resumebuilder.pdf.PdfRenderer;
import com.resumebuilder.resume.entity.Resume;
import com.resumebuilder.resume.repository.ResumeRepository;
import com.resumebuilder.storage.StorageService;
import com.resumebuilder.template.engine.ClassicTemplate;
import com.resumebuilder.template.engine.ModernTemplate;
import com.resumebuilder.template.engine.ExecutiveSerifTemplate;
import com.resumebuilder.template.engine.NavyBannerTemplate;
import com.resumebuilder.template.engine.SidebarMinimalistTemplate;
import com.resumebuilder.template.engine.ModernSplitTemplate;
import com.resumebuilder.template.engine.TechModernTemplate;
import com.resumebuilder.template.engine.TechAtsTemplate;
import com.resumebuilder.template.engine.EmeraldSidebarTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.resumebuilder.generation.dto.DownloadedFile;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ResumeGenerationServiceImpl implements ResumeGenerationService {

    private final ResumeRepository resumeRepository;
    private final AuthenticationFacade authenticationFacade;
    private final ModernTemplate modernTemplate;
    private final ClassicTemplate classicTemplate;
    private final ExecutiveSerifTemplate executiveSerifTemplate;
    private final NavyBannerTemplate navyBannerTemplate;
    private final SidebarMinimalistTemplate sidebarMinimalistTemplate;
    private final ModernSplitTemplate modernSplitTemplate;
    private final TechModernTemplate techModernTemplate;
    private final TechAtsTemplate techAtsTemplate;
    private final EmeraldSidebarTemplate emeraldSidebarTemplate;
    private final PdfRenderer pdfRenderer;
    private final StorageService storageService;
    private final GeneratedResumeRepository generatedResumeRepository;

    private static final int MAX_HTML_LENGTH_CHARS = 2_000_000; // ~2MB of text
    private static final long RENDER_TIMEOUT_SECONDS = 30;

    // Shared thread pool for PDF rendering timeouts. Using a cached pool
    // (instead of creating a new single-thread executor per request) avoids
    // unbounded thread creation under load — threads are reused after their
    // 60-second idle timeout, and the pool shrinks back to zero when idle.
    private static final ExecutorService RENDER_EXECUTOR =
            Executors.newCachedThreadPool(r -> {
                Thread t = new Thread(r, "pdf-render");
                t.setDaemon(true); // don't prevent JVM shutdown
                return t;
            });

    // Matches <script in any case, even with injected whitespace/newlines
    // between the '<' and 'script'. This catches obfuscation attempts like
    // "< script", "<\nscript", "<SCRIPT", etc.
    private static final Pattern SCRIPT_TAG_PATTERN =
            Pattern.compile("<\\s*script", Pattern.CASE_INSENSITIVE);

    @Transactional
    @Override
    public GenerateResumeResponse generate(UUID resumeId, ResumeTemplate template) {

        Resume resume = resumeRepository.findByIdAndUserId(
                resumeId,
                authenticationFacade.getCurrentUser().getId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("Resume not found"));

        String html = renderForTemplate(resume, template);
        byte[] pdfBytes = pdfRenderer.render(html);

        GeneratedResume generatedResume = new GeneratedResume();
        generatedResume.setResume(resume);
        generatedResume.setStorageIdentifier("pending");
        generatedResume.setTemplate(template);
        generatedResume = generatedResumeRepository.save(generatedResume);

        String storageIdentifier = storageService.store(generatedResume.getId(), pdfBytes);
        generatedResume.setStorageIdentifier(storageIdentifier);

        try {
            generatedResume = generatedResumeRepository.save(generatedResume);
        } catch (RuntimeException ex) {
            storageService.delete(storageIdentifier);
            throw ex;
        }

        return new GenerateResumeResponse(
                generatedResume.getId(),
                "/api/generated-resumes/" + generatedResume.getId() + "/download",
                generatedResume.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public String preview(UUID resumeId, ResumeTemplate template) {
        Resume resume = resumeRepository.findByIdAndUserId(
                resumeId,
                authenticationFacade.getCurrentUser().getId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("Resume not found"));

        return renderForTemplate(resume, template != null ? template : ResumeTemplate.MODERN);
    }

    private String renderForTemplate(Resume resume, ResumeTemplate template) {
        return switch (template) {
            case MODERN -> modernTemplate.render(resume);
            case CLASSIC -> classicTemplate.render(resume);
            case EXECUTIVE_SERIF -> executiveSerifTemplate.render(resume);
            case NAVY_BANNER -> navyBannerTemplate.render(resume);
            case SIDEBAR_MINIMALIST -> sidebarMinimalistTemplate.render(resume);
            case MODERN_SPLIT -> modernSplitTemplate.render(resume);
            case TECH_MODERN -> techModernTemplate.render(resume);
            case TECH_ATS -> techAtsTemplate.render(resume);
            case EMERALD_SIDEBAR -> emeraldSidebarTemplate.render(resume);
        };
    }

    /**
     * Builds a safe download filename from the user's name. Characters
     * outside [A-Za-z0-9 _-] are stripped to prevent HTTP response
     * splitting / header injection — a name containing '"' or '\n'
     * could otherwise break the Content-Disposition header.
     */
    private String buildDownloadFileName(GeneratedResume generatedResume) {

        Resume resume = generatedResume.getResume();

        if (resume.getPersonalInfo() != null
                && resume.getPersonalInfo().getFullName() != null
                && !resume.getPersonalInfo().getFullName().isBlank()) {

            String sanitized = resume.getPersonalInfo()
                    .getFullName()
                    .trim()
                    .replaceAll("[^A-Za-z0-9 _-]", "")
                    .replace(" ", "_");

            if (!sanitized.isBlank()) {
                return sanitized + "_Resume.pdf";
            }
        }

        return "resume.pdf";
    }

    @Override
    @Transactional(readOnly = true)
    public DownloadedFile download(UUID generatedResumeId) {

        GeneratedResume generatedResume =
                generatedResumeRepository
                        .findByIdAndResumeUserId(
                                generatedResumeId,
                                authenticationFacade.getCurrentUser().getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Generated resume not found"));

        byte[] pdfBytes =
                storageService.retrieve(generatedResume.getStorageIdentifier());

        String fileName =
                buildDownloadFileName(generatedResume);

        return new DownloadedFile(
                pdfBytes,
                fileName,
                MediaType.APPLICATION_PDF_VALUE
        );
    }

    @Override
    @Transactional
    public void delete(UUID generatedResumeId) {
        GeneratedResume generatedResume =
                generatedResumeRepository
                        .findByIdAndResumeUserId(
                                generatedResumeId,
                                authenticationFacade.getCurrentUser().getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Generated resume not found"));

        try {
            storageService.delete(generatedResume.getStorageIdentifier());
        } catch (Exception ignored) {
            // Ignore storage deletion errors to ensure db record is removed
        }
        generatedResumeRepository.delete(generatedResume);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GeneratedResumeSummary> listForResume(UUID resumeId) {

        List<GeneratedResume> generatedResumes =
                generatedResumeRepository.findAllByResumeIdAndResumeUserId(
                        resumeId,
                        authenticationFacade.getCurrentUser().getId()
                );

        // Ordered newest-first so the most recent download is what a
        // student sees at the top of their history, matching the
        // convention already used for achievementList/certificationList
        // on the Resume entity.
        return generatedResumes.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(gr -> new GeneratedResumeSummary(
                        gr.getId(),
                        "/api/generated-resumes/" + gr.getId() + "/download",
                        gr.getCreatedAt(),
                        gr.getFrontendTemplateName()
                ))
                .toList();
    }

    @Transactional
    public GenerateResumeResponse generateFromHtml(UUID resumeId, GenerateFromHtmlRequest request) {

        Resume resume = resumeRepository.findByIdAndUserId(
                resumeId,
                authenticationFacade.getCurrentUser().getId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("Resume not found"));

        String html = request.html();

        if (html.length() > MAX_HTML_LENGTH_CHARS) {
            throw new IllegalArgumentException(
                    "HTML content exceeds maximum allowed size of "
                            + MAX_HTML_LENGTH_CHARS + " characters");
        }

        if (SCRIPT_TAG_PATTERN.matcher(html).find()) {
            throw new IllegalArgumentException(
                    "HTML content must not contain <script> tags");
        }

        byte[] pdfBytes = renderWithTimeout(html);

        GeneratedResume generatedResume = new GeneratedResume();
        generatedResume.setResume(resume);
        generatedResume.setStorageIdentifier("pending");
        // The `template` enum column exists for the older Thymeleaf-based
        // generate() flow and is NOT NULL in the schema, so a value is
        // still required here even though it no longer drives rendering
        // for this code path. MODERN is used as a fixed, honest default
        // (not a guess at what the frontend actually rendered) -- the
        // REAL record of what the frontend used is frontendTemplateName
        // below, which is free-text and not constrained to this enum.
        generatedResume.setTemplate(com.resumebuilder.template.ResumeTemplate.MODERN);
        generatedResume.setFrontendTemplateName(request.templateName());
        generatedResume = generatedResumeRepository.save(generatedResume);

        String storageIdentifier = storageService.store(generatedResume.getId(), pdfBytes);
        generatedResume.setStorageIdentifier(storageIdentifier);

        try {
            generatedResume = generatedResumeRepository.save(generatedResume);
        } catch (RuntimeException ex) {
            storageService.delete(storageIdentifier);
            throw ex;
        }

        return new GenerateResumeResponse(
                generatedResume.getId(),
                "/api/generated-resumes/" + generatedResume.getId() + "/download",
                generatedResume.getCreatedAt()
        );
    }

    private byte[] renderWithTimeout(String html) {
        try {
            Future<byte[]> future = RENDER_EXECUTOR.submit(() -> pdfRenderer.render(html));
            return future.get(RENDER_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            throw new RuntimeException(
                    "PDF rendering timed out after " + RENDER_TIMEOUT_SECONDS + " seconds", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("PDF rendering was interrupted", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("PDF rendering failed", e.getCause());
        }
    }
}
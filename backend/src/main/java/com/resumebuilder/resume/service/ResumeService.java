package com.resumebuilder.resume.service;

import com.resumebuilder.ai.dto.GenerateDeclarationRequest;
import com.resumebuilder.ai.dto.GenerateSummaryRequest;
import com.resumebuilder.ai.service.AiRateLimiterService;
import com.resumebuilder.ai.service.ResumeAiService;
import com.resumebuilder.common.exception.PersonalInfoAlreadyExistsException;
import com.resumebuilder.common.exception.RateLimitExceededException;
import com.resumebuilder.common.exception.ResourceNotFoundException;
import com.resumebuilder.common.security.AuthenticationFacade;
import com.resumebuilder.common.enums.ResumeStatus;
import com.resumebuilder.pdf.PdfRenderer;
import com.resumebuilder.resume.dto.request.*;
import com.resumebuilder.resume.dto.response.*;
import com.resumebuilder.resume.entity.*;
import com.resumebuilder.resume.repository.*;
import com.resumebuilder.template.ResumeTemplate;
import com.resumebuilder.user.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.resumebuilder.template.engine.ModernTemplate;
import com.resumebuilder.template.engine.ClassicTemplate;
import com.resumebuilder.template.engine.ExecutiveSerifTemplate;
import com.resumebuilder.template.engine.NavyBannerTemplate;
import com.resumebuilder.template.engine.SidebarMinimalistTemplate;
import com.resumebuilder.template.engine.ModernSplitTemplate;
import com.resumebuilder.template.engine.TechModernTemplate;
import com.resumebuilder.template.engine.TechAtsTemplate;
import com.resumebuilder.template.engine.EmeraldSidebarTemplate;

import com.resumebuilder.generation.entity.GeneratedResume;
import com.resumebuilder.generation.repository.GeneratedResumeRepository;
import com.resumebuilder.storage.StorageService;

import java.util.List;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final EducationRepository educationRepository;
    private final AuthenticationFacade authenticationFacade;
    private final EntityManager entityManager;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final PersonalInfoRepository personalInfoRepository;
    private final CertificationRepository certificationRepository;
    private final GeneratedResumeRepository generatedResumeRepository;
    private final AchievementRepository achievementRepository;
    private final LanguageRepository languageRepository;
    private final StorageService storageService;

    @Transactional
    public ResumeResponse create(CreateResumeRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();

        String title = request.title();
        if (title == null || title.isBlank()) {
            title = "Untitled Resume";
        }

        Resume resume = new Resume();
        resume.setUser(currentUser);
        resume.setTitle(title);
        resume.setStatus(ResumeStatus.DRAFT);

        Resume saved = resumeRepository.save(resume);
        return new ResumeResponse(saved.getId(), saved.getTitle(), saved.getStatus(),
                saved.getSummary(), saved.getDeclaration(), saved.getStrengths());
    }

    public ResumeResponse findById(UUID resumeId) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        return new ResumeResponse(resume.getId(), resume.getTitle(), resume.getStatus(),
                resume.getSummary(), resume.getDeclaration(), resume.getStrengths());
    }

    // Paginated list of the current user's resumes (GET /api/resumes).
    // Returns ResumeSummaryResponse, not the full FullResumeResponse --
    // see that DTO's javadoc for why a list view is deliberately kept
    // lightweight.
    public Page<ResumeSummaryResponse> listResumes(Pageable pageable) {
        User currentUser = authenticationFacade.getCurrentUser();
        return resumeRepository.findByUserId(currentUser.getId(), pageable)
                .map(resume -> new ResumeSummaryResponse(
                        resume.getId(),
                        resume.getTitle(),
                        resume.getStatus(),
                        resume.getUpdatedAt()));
    }

    public FullResumeResponse findFullById(UUID resumeId) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findFullByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        ResumeResponse resumeResponse = new ResumeResponse(
                resume.getId(), resume.getTitle(), resume.getStatus(),
                resume.getSummary(), resume.getDeclaration(), resume.getStrengths());

        PersonalInfoResponse personalInfoResponse = null;
        if (resume.getPersonalInfo() != null) {
            var pi = resume.getPersonalInfo();
            personalInfoResponse = new PersonalInfoResponse(
                    pi.getId(), pi.getFullName(), pi.getJobTitle(), pi.getEmail(), pi.getPhone(),
                    pi.getLocation(), pi.getLinkedinUrl(), pi.getGithubUrl(), pi.getPortfolioUrl(),
                    pi.getPhotoUrl());
        }

        List<EducationResponse> educationResponses = resume.getEducationList().stream()
                .map(e -> new EducationResponse(
                        e.getId(), e.getInstitution(), e.getDegree(),
                        e.getFieldOfStudy(), e.getGrade(), e.getStartDate(), e.getEndDate()))
                .toList();

        List<ExperienceResponse> experienceResponses = resume.getExperienceList().stream()
                .map(e -> new ExperienceResponse(
                        e.getId(), e.getCompany(), e.getJobTitle(), e.getDescription(),
                        e.getStartDate(), e.getEndDate(), e.isCurrentlyWorking()))
                .toList();

        List<ProjectResponse> projectResponses = resume.getProjectList().stream()
                .map(p -> new ProjectResponse(
                        p.getId(), p.getTitle(), p.getDescription(), p.getGithubUrl(),
                        p.getDemoUrl(), p.getStartDate(), p.getEndDate(), p.isCurrentlyBuilding()))
                .toList();

        List<SkillResponse> skillResponses = resume.getSkillList().stream()
                .map(s -> new SkillResponse(s.getId(), s.getName()))
                .toList();

        List<CertificationResponse> certificationResponses = resume.getCertificationList().stream()
                .map(c -> new CertificationResponse(
                        c.getId(), c.getName(), c.getIssuingOrganization(),
                        c.getIssueDate(), c.getExpirationDate(),
                        c.getCredentialId(), c.getCredentialUrl()))
                .toList();


        List<AchievementResponse> achievementResponses = resume.getAchievementList().stream()
                .map(a -> new AchievementResponse(
                        a.getId(), a.getTitle(), a.getDescription(),
                        a.getIssuer(), a.getAchievementDate()))
                .toList();

        List<LanguageResponse> languageResponses = resume.getLanguageList().stream()
                .map(l -> new LanguageResponse(
                        l.getId(), l.getLanguageName(), l.getProficiencyLevel()))
                .toList();

        return new FullResumeResponse(
                resumeResponse, personalInfoResponse, educationResponses,
                experienceResponses, projectResponses, skillResponses,
                certificationResponses, achievementResponses, languageResponses);

    }

    @Transactional
    public ResumeResponse update(UUID resumeId, UpdateResumeRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (request.title() != null && !request.title().isBlank()) {
            resume.setTitle(request.title());
        }
        if (request.summary() != null && !request.summary().isBlank()) {
            resume.setSummary(request.summary());
        }
        if (request.declaration() != null && !request.declaration().isBlank()) {
            resume.setDeclaration(request.declaration());
        }
        if (request.strengths() != null) {
            resume.setStrengths(request.strengths());
        }

        Resume saved = resumeRepository.save(resume);
        return new ResumeResponse(saved.getId(), saved.getTitle(), saved.getStatus(),
                saved.getSummary(), saved.getDeclaration(), saved.getStrengths());
    }

    @Transactional
    public EducationResponse addEducation(UUID resumeId, EducationRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Education education = new Education();
        education.setResume(resume);
        education.setInstitution(request.institution());
        education.setDegree(request.degree());
        education.setFieldOfStudy(request.fieldOfStudy());
        education.setGrade(request.grade());
        education.setStartDate(request.startDate());
        education.setEndDate(request.endDate());

        resume.getEducationList().add(education);
        entityManager.persist(education);
        entityManager.flush();

        return new EducationResponse(
                education.getId(),
                education.getInstitution(),
                education.getDegree(),
                education.getFieldOfStudy(),
                education.getGrade(),
                education.getStartDate(),
                education.getEndDate()
        );
    }

    @Transactional
    public ExperienceResponse addExperience(UUID resumeId, ExperienceRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Experience experience = new Experience();
        experience.setResume(resume);
        experience.setCompany(request.company());
        experience.setJobTitle(request.jobTitle());
        experience.setDescription(request.description());
        experience.setStartDate(request.startDate());
        experience.setEndDate(request.endDate());
        experience.setCurrentlyWorking(request.currentlyWorking());

        resume.getExperienceList().add(experience);
        entityManager.persist(experience);
        entityManager.flush();

        return new ExperienceResponse(
                experience.getId(),
                experience.getCompany(),
                experience.getJobTitle(),
                experience.getDescription(),
                experience.getStartDate(),
                experience.getEndDate(),
                experience.isCurrentlyWorking()
        );
    }



    @Transactional
    public ProjectResponse addProject(UUID resumeId, ProjectRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Project project = new Project();
        project.setResume(resume);
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setGithubUrl(request.githubUrl());
        project.setDemoUrl(request.demoUrl());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setCurrentlyBuilding(request.currentlyBuilding());

        resume.getProjectList().add(project);
        entityManager.persist(project);
        entityManager.flush();

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getGithubUrl(),
                project.getDemoUrl(),
                project.getStartDate(),
                project.getEndDate(),
                project.isCurrentlyBuilding()
        );
    }


    @Transactional
    public SkillResponse addSkill(UUID resumeId, SkillRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Skill skill = new Skill();
        skill.setResume(resume);
        skill.setName(request.name());

        resume.getSkillList().add(skill);
        entityManager.persist(skill);
        entityManager.flush();

        return new SkillResponse(
                skill.getId(),
                skill.getName()
        );
    }

    @Transactional
    public PersonalInfoResponse addPersonalInfo(UUID resumeId, PersonalInfoRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (resume.getPersonalInfo() != null) {
            throw new PersonalInfoAlreadyExistsException("Personal info already exists for this resume");
        }

        PersonalInfo personalInfo = new PersonalInfo();
        personalInfo.setResume(resume);
        personalInfo.setFullName(request.fullName());
        personalInfo.setJobTitle(request.jobTitle());
        personalInfo.setEmail(request.email());
        personalInfo.setPhone(request.phone());
        personalInfo.setLocation(request.location());
        personalInfo.setLinkedinUrl(request.linkedinUrl());
        personalInfo.setGithubUrl(request.githubUrl());
        personalInfo.setPortfolioUrl(request.portfolioUrl());
        personalInfo.setPhotoUrl(request.photoUrl());

        resume.setPersonalInfo(personalInfo);
        personalInfo = personalInfoRepository.save(personalInfo);

        return new PersonalInfoResponse(
                personalInfo.getId(),
                personalInfo.getFullName(),
                personalInfo.getJobTitle(),
                personalInfo.getEmail(),
                personalInfo.getPhone(),
                personalInfo.getLocation(),
                personalInfo.getLinkedinUrl(),
                personalInfo.getGithubUrl(),
                personalInfo.getPortfolioUrl(),
                personalInfo.getPhotoUrl()
        );
    }

    @Transactional
    public EducationResponse updateEducation(UUID educationId, EducationRequest request) {

        User currentUser = authenticationFacade.getCurrentUser();

        Education education = educationRepository
                .findByIdAndResumeUserId(educationId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Education not found"));

        education.setInstitution(request.institution());
        education.setDegree(request.degree());
        education.setFieldOfStudy(request.fieldOfStudy());
        education.setGrade(request.grade());
        education.setStartDate(request.startDate());
        education.setEndDate(request.endDate());

        return new EducationResponse(
                education.getId(),
                education.getInstitution(),
                education.getDegree(),
                education.getFieldOfStudy(),
                education.getGrade(),
                education.getStartDate(),
                education.getEndDate()
        );
    }

    //update experience
    @Transactional
    public ExperienceResponse updateExperience(
            UUID experienceId,
            ExperienceRequest request) {

        User currentUser = authenticationFacade.getCurrentUser();

        Experience experience = experienceRepository
                .findByIdAndResumeUserId(experienceId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        experience.setCompany(request.company());
        experience.setJobTitle(request.jobTitle());
        experience.setDescription(request.description());
        experience.setStartDate(request.startDate());
        experience.setEndDate(request.endDate());
        experience.setCurrentlyWorking(request.currentlyWorking());

        return new ExperienceResponse(
                experience.getId(),
                experience.getCompany(),
                experience.getJobTitle(),
                experience.getDescription(),
                experience.getStartDate(),
                experience.getEndDate(),
                experience.isCurrentlyWorking()
        );
    }

    //update Project
    @Transactional
    public ProjectResponse updateProject(
            UUID projectId,
            ProjectRequest request) {

        User currentUser = authenticationFacade.getCurrentUser();

        Project project = projectRepository
                .findByIdAndResumeUserId(projectId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setGithubUrl(request.githubUrl());
        project.setDemoUrl(request.demoUrl());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setCurrentlyBuilding(request.currentlyBuilding());

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getGithubUrl(),
                project.getDemoUrl(),
                project.getStartDate(),
                project.getEndDate(),
                project.isCurrentlyBuilding()
        );
    }

    //update skilll
    @Transactional
    public SkillResponse updateSkill(
            UUID skillId,
            SkillRequest request) {

        User currentUser = authenticationFacade.getCurrentUser();

        Skill skill = skillRepository
                .findByIdAndResumeUserId(skillId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found"));

        skill.setName(request.name());

        return new SkillResponse(
                skill.getId(),
                skill.getName()
        );
    }

    //update personal Info
    @Transactional
    public PersonalInfoResponse updatePersonalInfo(
            UUID personalInfoId,
            PersonalInfoRequest request) {

        User currentUser = authenticationFacade.getCurrentUser();

        PersonalInfo personalInfo = personalInfoRepository
                .findByIdAndResumeUserId(personalInfoId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Personal info not found"));

        personalInfo.setFullName(request.fullName());
        personalInfo.setJobTitle(request.jobTitle());
        personalInfo.setEmail(request.email());
        personalInfo.setPhone(request.phone());
        personalInfo.setLocation(request.location());
        personalInfo.setLinkedinUrl(request.linkedinUrl());
        personalInfo.setGithubUrl(request.githubUrl());
        personalInfo.setPortfolioUrl(request.portfolioUrl());
        personalInfo.setPhotoUrl(request.photoUrl());

        personalInfo = personalInfoRepository.save(personalInfo);

        return new PersonalInfoResponse(
                personalInfo.getId(),
                personalInfo.getFullName(),
                personalInfo.getJobTitle(),
                personalInfo.getEmail(),
                personalInfo.getPhone(),
                personalInfo.getLocation(),
                personalInfo.getLinkedinUrl(),
                personalInfo.getGithubUrl(),
                personalInfo.getPortfolioUrl(),
                personalInfo.getPhotoUrl()
        );
    }


    //delete Education
    @Transactional
    public void deleteEducation(UUID educationId) {
        User currentUser = authenticationFacade.getCurrentUser();

        Education education = educationRepository
                .findByIdAndResumeUserId(educationId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Education not found"));

        educationRepository.delete(education);
    }

    //delete experience
    @Transactional
    public void deleteExperience(UUID experienceId) {

        User currentUser = authenticationFacade.getCurrentUser();

        Experience experience = experienceRepository
                .findByIdAndResumeUserId(experienceId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Experience not found"));

        experienceRepository.delete(experience);
    }

    //delete project
    @Transactional
    public void deleteProject(UUID projectId) {

        User currentUser = authenticationFacade.getCurrentUser();

        Project project = projectRepository
                .findByIdAndResumeUserId(projectId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        projectRepository.delete(project);
    }

    //delete skill

    @Transactional
    public void deleteSkill(UUID skillId) {

        User currentUser = authenticationFacade.getCurrentUser();

        Skill skill = skillRepository
                .findByIdAndResumeUserId(skillId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found"));

        skillRepository.delete(skill);
    }

    @Transactional
    public void deleteLanguage(UUID languageId) {
        User currentUser = authenticationFacade.getCurrentUser();

        Language language = languageRepository
                .findByIdAndResumeUserId(languageId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Language not found"));

        languageRepository.delete(language);
    }


    public Resume findEntityById(UUID resumeId) {
        User currentUser = authenticationFacade.getCurrentUser();
        return resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
    }

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

    public String renderTemplate(UUID resumeId, ResumeTemplate template) {
        Resume resume = findEntityById(resumeId);
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

    public byte[] generatePdfPreview(UUID resumeId, ResumeTemplate template) {
        String html = renderTemplate(resumeId, template);
        return pdfRenderer.render(html);
    }

    //delete Resume

    @Transactional
    public void deleteResume(UUID resumeId) {

        User currentUser = authenticationFacade.getCurrentUser();

        Resume resume = resumeRepository
                .findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resume not found"));

        List<GeneratedResume> generatedResumes =
                generatedResumeRepository.findAllByResumeIdAndResumeUserId(
                        resumeId,
                        currentUser.getId()
                );

        for (GeneratedResume generatedResume : generatedResumes) {
            storageService.delete(generatedResume.getStorageIdentifier());
        }

        generatedResumeRepository.deleteAll(generatedResumes);

        resumeRepository.delete(resume);
    }


    @Transactional
    public CertificationResponse addCertification(UUID resumeId, CertificationRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Certification certification = new Certification();
        certification.setResume(resume);
        certification.setName(request.name());
        certification.setIssuingOrganization(request.issuingOrganization());
        certification.setIssueDate(request.issueDate());
        certification.setExpirationDate(request.expirationDate());
        certification.setCredentialId(request.credentialId());
        certification.setCredentialUrl(request.credentialUrl());

        resume.getCertificationList().add(certification);
        entityManager.persist(certification);
        entityManager.flush();

        return new CertificationResponse(
                certification.getId(),
                certification.getName(),
                certification.getIssuingOrganization(),
                certification.getIssueDate(),
                certification.getExpirationDate(),
                certification.getCredentialId(),
                certification.getCredentialUrl()
        );
    }

    @Transactional
    public CertificationResponse updateCertification(
            UUID certificationId,
            CertificationRequest request) {

        User currentUser = authenticationFacade.getCurrentUser();

        Certification certification = certificationRepository
                .findByIdAndResumeUserId(certificationId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Certification not found"));

        certification.setName(request.name());
        certification.setIssuingOrganization(request.issuingOrganization());
        certification.setIssueDate(request.issueDate());
        certification.setExpirationDate(request.expirationDate());
        certification.setCredentialId(request.credentialId());
        certification.setCredentialUrl(request.credentialUrl());

        return new CertificationResponse(
                certification.getId(),
                certification.getName(),
                certification.getIssuingOrganization(),
                certification.getIssueDate(),
                certification.getExpirationDate(),
                certification.getCredentialId(),
                certification.getCredentialUrl()
        );
    }

    @Transactional
    public void deleteCertification(UUID certificationId) {

        User currentUser = authenticationFacade.getCurrentUser();

        Certification certification = certificationRepository
                .findByIdAndResumeUserId(certificationId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Certification not found"));

        certificationRepository.delete(certification);
    }

    @Transactional
    public AchievementResponse addAchievement(UUID resumeId, AchievementRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Achievement achievement = new Achievement();
        achievement.setResume(resume);
        achievement.setTitle(request.title());
        achievement.setDescription(request.description());
        achievement.setIssuer(request.issuer());
        achievement.setAchievementDate(request.achievementDate());

        resume.getAchievementList().add(achievement);
        entityManager.persist(achievement);
        entityManager.flush();

        return new AchievementResponse(
                achievement.getId(), achievement.getTitle(), achievement.getDescription(),
                achievement.getIssuer(), achievement.getAchievementDate());
    }

    @Transactional
    public AchievementResponse updateAchievement(UUID achievementId, AchievementRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();

        Achievement achievement = achievementRepository
                .findByIdAndResumeUserId(achievementId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found"));

        achievement.setTitle(request.title());
        achievement.setDescription(request.description());
        achievement.setIssuer(request.issuer());
        achievement.setAchievementDate(request.achievementDate());

        return new AchievementResponse(
                achievement.getId(), achievement.getTitle(), achievement.getDescription(),
                achievement.getIssuer(), achievement.getAchievementDate());
    }

    @Transactional
    public void deleteAchievement(UUID achievementId) {
        User currentUser = authenticationFacade.getCurrentUser();

        Achievement achievement = achievementRepository
                .findByIdAndResumeUserId(achievementId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found"));

        achievementRepository.delete(achievement);
    }

    @Transactional
    public LanguageResponse addLanguage(UUID resumeId, LanguageRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        Language language = new Language();
        language.setResume(resume);
        language.setLanguageName(request.languageName());
        language.setProficiencyLevel(request.proficiencyLevel());

        resume.getLanguageList().add(language);
        entityManager.persist(language);
        entityManager.flush();

        return new LanguageResponse(
                language.getId(), language.getLanguageName(), language.getProficiencyLevel());
    }

    @Transactional
    public LanguageResponse updateLanguage(UUID languageId, LanguageRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();

        Language language = languageRepository
                .findByIdAndResumeUserId(languageId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Language not found"));

        language.setLanguageName(request.languageName());
        language.setProficiencyLevel(request.proficiencyLevel());

        return new LanguageResponse(
                language.getId(), language.getLanguageName(), language.getProficiencyLevel());
    }


    //adding Ai
    private final ResumeAiService resumeAiService; // add to constructor-injected fields
    private final AiRateLimiterService aiRateLimiterService; // add to constructor-injected fields

    @Transactional
    public ResumeResponse generateSummary(UUID resumeId, GenerateSummaryRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();

        // Checked before the DB fetch and AI call, not after — a throttled
        // request should fail fast without spending a query or an API call.
        if (!aiRateLimiterService.tryConsume(currentUser.getId())) {
            throw new RateLimitExceededException(
                    "You've reached the AI generation limit. Please try again later.");
        }

        Resume resume = resumeRepository.findFullByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        String summary = resumeAiService.generateSummary(
                resume, request.targetJobTitle(), request.targetJobDescription());
        resume.setSummary(summary);

        Resume saved = resumeRepository.save(resume);
        return new ResumeResponse(saved.getId(), saved.getTitle(), saved.getStatus(),
                saved.getSummary(), saved.getDeclaration(), saved.getStrengths());
    }

    @Transactional
    public ResumeResponse generateDeclaration(UUID resumeId, GenerateDeclarationRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();

        if (!aiRateLimiterService.tryConsume(currentUser.getId())) {
            throw new RateLimitExceededException(
                    "You've reached the AI generation limit. Please try again later.");
        }

        Resume resume = resumeRepository.findFullByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        String declaration = resumeAiService.generateDeclaration(resume, request.city());
        resume.setDeclaration(declaration);

        Resume saved = resumeRepository.save(resume);
        return new ResumeResponse(saved.getId(), saved.getTitle(), saved.getStatus(),
                saved.getSummary(), saved.getDeclaration(), saved.getStrengths());
    }
}
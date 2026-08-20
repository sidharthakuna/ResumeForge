package com.resumebuilder.generation.entity;

import com.resumebuilder.common.entity.BaseEntity;
import com.resumebuilder.resume.entity.Resume;
import com.resumebuilder.template.ResumeTemplate;
import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "generated_resumes")
public class GeneratedResume extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false)
    private String storageIdentifier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResumeTemplate template;

    // Free-text label for whichever template the FRONTEND itself rendered,
    // decoupled from the backend ResumeTemplate enum above. Populated by
    // generate-from-html; left null by the older Thymeleaf-based generate()
    // flow, which has no equivalent concept. See V11 migration for the
    // full reasoning.
    @Column(name = "frontend_template_name", length = 100)
    private String frontendTemplateName;
}
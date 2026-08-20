package com.resumebuilder.resume.entity;

import com.resumebuilder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "certifications")
@NoArgsConstructor
public class Certification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String issuingOrganization;

    private LocalDate issueDate;

    private LocalDate expirationDate;

    @Column(length = 100)
    private String credentialId;

    @Column(length = 500)
    private String credentialUrl;

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIssuingOrganization() { return issuingOrganization; }
    public void setIssuingOrganization(String issuingOrganization) { this.issuingOrganization = issuingOrganization; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }
    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
}
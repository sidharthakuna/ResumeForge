package com.resumebuilder.resume.entity;

import com.resumebuilder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "achievements")
@NoArgsConstructor
public class Achievement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 150)
    private String issuer;

    private LocalDate achievementDate;

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public LocalDate getAchievementDate() { return achievementDate; }
    public void setAchievementDate(LocalDate achievementDate) { this.achievementDate = achievementDate; }
}
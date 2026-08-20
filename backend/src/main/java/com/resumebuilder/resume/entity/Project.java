package com.resumebuilder.resume.entity;

import com.resumebuilder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "projects")
@NoArgsConstructor
public class Project extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String githubUrl;

    @Column(length = 500)
    private String demoUrl;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    private boolean currentlyBuilding = false;

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getDemoUrl() { return demoUrl; }
    public void setDemoUrl(String demoUrl) { this.demoUrl = demoUrl; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public boolean isCurrentlyBuilding() { return currentlyBuilding; }
    public void setCurrentlyBuilding(boolean currentlyBuilding) { this.currentlyBuilding = currentlyBuilding; }
}
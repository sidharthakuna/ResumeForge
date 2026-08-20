package com.resumebuilder.resume.entity;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "personal_info")
@NoArgsConstructor
public class PersonalInfo {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Resume resume;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 150)
    private String jobTitle;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String location;

    @Column(length = 500)
    private String linkedinUrl;

    @Column(length = 500)
    private String githubUrl;

    @Column(length = 500)
    private String portfolioUrl;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
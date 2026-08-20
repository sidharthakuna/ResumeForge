package com.resumebuilder.resume.entity;

import com.resumebuilder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "education")
@NoArgsConstructor
public class Education extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false, length = 150)
    private String institution;

    @Column(nullable = false, length = 100)
    private String degree;

    @Column(length = 100)
    private String fieldOfStudy;

    @Column(length = 100)
    private String grade;

    private LocalDate startDate;

    private LocalDate endDate;

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public String getFieldOfStudy() { return fieldOfStudy; }
    public void setFieldOfStudy(String fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}

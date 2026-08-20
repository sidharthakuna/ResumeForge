package com.resumebuilder.resume.entity;

import com.resumebuilder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "languages")
@NoArgsConstructor
public class Language extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false, length = 100)
    private String languageName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProficiencyLevel proficiencyLevel;

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }
    public String getLanguageName() { return languageName; }
    public void setLanguageName(String languageName) { this.languageName = languageName; }
    public ProficiencyLevel getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(ProficiencyLevel proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
}
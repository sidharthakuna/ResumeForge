package com.resumebuilder.resume.entity;

import com.resumebuilder.common.entity.BaseEntity;
import com.resumebuilder.common.enums.ResumeStatus;
import com.resumebuilder.user.entity.User;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resumes")
@NoArgsConstructor
// IMPORTANT: this entity graph deliberately fetches ONLY personalInfo
// eagerly, not any of the seven List-typed child collections. Hibernate
// cannot JOIN FETCH two or more List ("bag") collections on the same root
// entity in a single query -- it throws MultipleBagFetchException, since a
// List has no natural uniqueness Hibernate can use to safely reconstruct
// multiple independent one-to-many collections from one flattened result
// set. (Confirmed directly: adding even educationList+experienceList
// together to a JOIN FETCH query threw exactly this exception during
// development of the /full endpoint -- see ResumeRepository.
// findFullByIdAndUserId for the full explanation.)
//
// Before this fix, this graph listed personalInfo + FOUR bag collections
// (educationList, experienceList, skillList, projectList) together, which
// would have thrown MultipleBagFetchException the moment findById(UUID)
// was ever actually called -- it happened to never surface because no
// code in this project currently calls that method. Rather than add the
// three newer collections (certificationList, achievementList,
// languageList) on top of an already-broken graph, this fixes the
// pre-existing problem too: only personalInfo is eager-fetched here. All
// seven List collections load lazily via Hibernate's normal mechanism,
// which works safely because spring.jpa.open-in-view is enabled (Spring
// Boot's default), keeping the Hibernate session open for the life of the
// HTTP request.
@NamedEntityGraph(
        name = "Resume.withDetails",
        attributeNodes = {
                @NamedAttributeNode("personalInfo")
        }
)
public class Resume extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ResumeStatus status = ResumeStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String snapshotData;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String declaration;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startDate ASC")
    private List<Education> educationList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startDate ASC")
    private List<Experience> experienceList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> skillList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startDate ASC")
    private List<Project> projectList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("issueDate DESC")
    private List<Certification> certificationList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("achievementDate DESC")
    private List<Achievement> achievementList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Language> languageList = new ArrayList<>();


    @OneToOne(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private PersonalInfo personalInfo;

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public ResumeStatus getStatus() { return status; }
    public void setStatus(ResumeStatus status) { this.status = status; }
    public String getSnapshotData() { return snapshotData; }
    public void setSnapshotData(String snapshotData) { this.snapshotData = snapshotData; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getDeclaration() { return declaration; }
    public void setDeclaration(String declaration) { this.declaration = declaration; }
    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    public PersonalInfo getPersonalInfo() { return personalInfo; }
    public void setPersonalInfo(PersonalInfo personalInfo) { this.personalInfo = personalInfo; }
    public List<Education> getEducationList() { return educationList; }
    public void setEducationList(List<Education> educationList) { this.educationList = educationList; }
    public List<Experience> getExperienceList() { return experienceList; }
    public void setExperienceList(List<Experience> experienceList) { this.experienceList = experienceList; }
    public List<Skill> getSkillList() { return skillList; }
    public void setSkillList(List<Skill> skillList) { this.skillList = skillList; }
    public List<Project> getProjectList() { return projectList; }
    public void setProjectList(List<Project> projectList) { this.projectList = projectList; }
    public List<Certification> getCertificationList() { return certificationList; }
    public void setCertificationList(List<Certification> certificationList) { this.certificationList = certificationList; }
    public List<Achievement> getAchievementList() { return achievementList; }
    public void setAchievementList(List<Achievement> achievementList) { this.achievementList = achievementList; }
    public List<Language> getLanguageList() { return languageList; }
    public void setLanguageList(List<Language> languageList) { this.languageList = languageList; }
}


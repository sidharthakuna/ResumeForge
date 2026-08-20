package com.resumebuilder.resume;

import com.resumebuilder.config.JpaAuditingConfig;
import com.resumebuilder.resume.entity.Education;
import com.resumebuilder.resume.entity.Experience;
import com.resumebuilder.resume.entity.PersonalInfo;
import com.resumebuilder.resume.entity.Resume;
import com.resumebuilder.resume.repository.ResumeRepository;
import com.resumebuilder.user.entity.User;
import com.resumebuilder.user.enums.Role;
import com.resumebuilder.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaAuditingConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ResumeRepositoryTest {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void findByIdWithDetails_returnsResumeWithChildCollectionsPopulated() {
        User user = new User();
        user.setEmail("query.check@example.com");
        user.setPassword("irrelevant-for-this-test");
        user.setFullName("Query Check");
        user.setRole(Role.USER);
        userRepository.save(user);

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setTitle("Backend Engineer Resume");

        Education education = new Education();
        education.setResume(resume);
        education.setInstitution("Test University");
        education.setDegree("B.Tech");
        education.setStartDate(LocalDate.of(2020, 1, 1));
        resume.getEducationList().add(education);

        Experience experience = new Experience();
        experience.setResume(resume);
        experience.setCompany("Test Corp");
        experience.setJobTitle("Backend Intern");
        experience.setStartDate(LocalDate.of(2023, 6, 1));
        resume.getExperienceList().add(experience);

        PersonalInfo personalInfo = new PersonalInfo();
        personalInfo.setResume(resume);
        personalInfo.setFullName("Query Check");
        personalInfo.setEmail("query.check@example.com");
        resume.setPersonalInfo(personalInfo);

        resumeRepository.save(resume);

        entityManager.flush();
        entityManager.clear();

        Resume loaded = resumeRepository.findById(resume.getId())
                .orElseThrow();

        assertThat(loaded.getEducationList()).hasSize(1);
        assertThat(loaded.getExperienceList()).hasSize(1);
        assertThat(loaded.getPersonalInfo()).isNotNull();
        assertThat(loaded.getPersonalInfo().getFullName()).isEqualTo("Query Check");
    }
    @Test
    void findByIdAndUserId_returnsResumeWithChildCollectionsPopulated_whenOwnedByUser() {
        User user = new User();
        user.setEmail("ownership.check@example.com");
        user.setPassword("irrelevant-for-this-test");
        user.setFullName("Ownership Check");
        user.setRole(Role.USER);
        userRepository.save(user);

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setTitle("Ownership Test Resume");

        Education education = new Education();
        education.setResume(resume);
        education.setInstitution("Test University");
        education.setDegree("B.Tech");
        education.setStartDate(LocalDate.of(2020, 1, 1));
        resume.getEducationList().add(education);

        Experience experience = new Experience();
        experience.setResume(resume);
        experience.setCompany("Test Corp");
        experience.setJobTitle("Backend Intern");
        experience.setStartDate(LocalDate.of(2023, 6, 1));
        resume.getExperienceList().add(experience);

        resumeRepository.save(resume);

        entityManager.flush();
        entityManager.clear();

        Resume loaded = resumeRepository.findByIdAndUserId(resume.getId(), user.getId())
                .orElseThrow();

        assertThat(loaded.getEducationList()).hasSize(1);
        assertThat(loaded.getExperienceList()).hasSize(1);
    }

    @Test
    void findByIdAndUserId_returnsEmpty_whenResumeBelongsToDifferentUser() {
        User owner = new User();
        owner.setEmail("actual.owner@example.com");
        owner.setPassword("irrelevant");
        owner.setFullName("Actual Owner");
        owner.setRole(Role.USER);
        userRepository.save(owner);

        User intruder = new User();
        intruder.setEmail("intruder@example.com");
        intruder.setPassword("irrelevant");
        intruder.setFullName("Intruder");
        intruder.setRole(Role.USER);
        userRepository.save(intruder);

        Resume resume = new Resume();
        resume.setUser(owner);
        resume.setTitle("Private Resume");
        resumeRepository.save(resume);

        entityManager.flush();
        entityManager.clear();

        var result = resumeRepository.findByIdAndUserId(resume.getId(), intruder.getId());

        assertThat(result).isEmpty();
    }
}
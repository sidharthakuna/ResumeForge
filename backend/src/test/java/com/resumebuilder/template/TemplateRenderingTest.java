package com.resumebuilder.template;

import com.resumebuilder.resume.entity.*;
import com.resumebuilder.template.engine.TechAtsTemplate;
import com.resumebuilder.template.engine.TechModernTemplate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TemplateRenderingTest {

    @Autowired
    private TechModernTemplate techModernTemplate;

    @Autowired
    private TechAtsTemplate techAtsTemplate;

    @Autowired
    private com.resumebuilder.template.engine.EmeraldSidebarTemplate emeraldSidebarTemplate;

    private Resume createSampleResume() {
        Resume resume = new Resume();
        resume.setTitle("Software Engineering Student");
        resume.setSummary("Computer Science undergraduate with strong foundation in distributed systems, Java, and cloud architectures.");
        resume.setStrengths("Strong problem-solving mindset\nQuick learner and self-motivated");
        resume.setDeclaration("I hereby declare that the information provided is true and accurate.");

        PersonalInfo pi = new PersonalInfo();
        pi.setFullName("Alex Rivera");
        pi.setJobTitle("Software Engineering Student");
        pi.setEmail("alex.rivera@example.com");
        pi.setPhone("+1 (555) 739-2841");
        pi.setLocation("San Francisco, CA");
        pi.setGithubUrl("github.com/alexrivera-dev");
        pi.setPortfolioUrl("alexrivera.dev");
        pi.setLinkedinUrl("linkedin.com/in/alexrivera-dev");
        resume.setPersonalInfo(pi);

        Experience exp1 = new Experience();
        exp1.setJobTitle("Software Engineering Intern");
        exp1.setCompany("Apex Cloud Systems");
        exp1.setDescription("Engineered distributed event-driven microservices\nDesigned high-throughput PostgreSQL query optimization strategies");
        exp1.setStartDate(LocalDate.of(2024, 6, 1));
        exp1.setCurrentlyWorking(true);

        Experience exp2 = new Experience();
        exp2.setJobTitle("Backend Developer Intern");
        exp2.setCompany("NovaTech Labs");
        exp2.setDescription("Architected secure RESTful APIs with JWT authentication\nContainerized multi-service development environments with Docker");
        exp2.setStartDate(LocalDate.of(2023, 5, 1));
        exp2.setEndDate(LocalDate.of(2023, 12, 1));
        exp2.setCurrentlyWorking(false);

        resume.setExperienceList(new ArrayList<>());
        resume.getExperienceList().add(exp1);
        resume.getExperienceList().add(exp2);

        Project proj1 = new Project();
        proj1.setTitle("CloudPulse — Distributed Microservices & Metrics Engine");
        proj1.setDescription("Architected an end-to-end cloud monitoring platform using Spring Cloud, Go, and React.");
        proj1.setStartDate(LocalDate.of(2024, 1, 1));
        proj1.setEndDate(LocalDate.of(2024, 5, 1));
        proj1.setCurrentlyBuilding(false);

        Project proj2 = new Project();
        proj2.setTitle("AI Document & Audio Intelligence Hub");
        proj2.setDescription("Developed full-stack multimodal document and audio processing platform using Java and Python FastAPI.");
        proj2.setStartDate(LocalDate.of(2023, 10, 1));
        proj2.setEndDate(LocalDate.of(2024, 2, 1));
        proj2.setCurrentlyBuilding(false);

        Project proj3 = new Project();
        proj3.setTitle("ResumeForge — Full-Stack AI Resume Engine");
        proj3.setDescription("Engineered a production-ready resume building suite with Spring Boot 3 and React 19.");
        proj3.setStartDate(LocalDate.of(2024, 2, 1));
        proj3.setCurrentlyBuilding(true);

        resume.setProjectList(new ArrayList<>());
        resume.getProjectList().add(proj1);
        resume.getProjectList().add(proj2);
        resume.getProjectList().add(proj3);

        Education edu = new Education();
        edu.setDegree("B.S. Computer Science & Engineering");
        edu.setFieldOfStudy("Computer Science");
        edu.setGrade("3.92 / 4.0");
        edu.setInstitution("University of California, Berkeley");
        edu.setStartDate(LocalDate.of(2021, 8, 1));
        resume.setEducationList(new ArrayList<>());
        resume.getEducationList().add(edu);

        Skill s1 = new Skill();
        s1.setName("Programming Languages: Java, Python, TypeScript, JavaScript, C++, Go, SQL");
        Skill s2 = new Skill();
        s2.setName("Backend Technologies: Spring Boot 3, REST APIs, Microservices, Hibernate");
        resume.setSkillList(new ArrayList<>());
        resume.getSkillList().add(s1);
        resume.getSkillList().add(s2);

        Language l1 = new Language();
        l1.setLanguageName("English");
        Language l2 = new Language();
        l2.setLanguageName("Spanish");
        resume.setLanguageList(new ArrayList<>());
        resume.getLanguageList().add(l1);
        resume.getLanguageList().add(l2);

        return resume;
    }

    @Test
    void techModernTemplate_rendersCorrectHtmlStructure() {
        Resume resume = createSampleResume();
        String html = techModernTemplate.render(resume);

        assertThat(html).isNotNull();
        assertThat(html).contains("Alex Rivera");
        assertThat(html).contains("Software Engineering Student");
        assertThat(html).contains("San Francisco, CA");
        assertThat(html).contains("alex.rivera@example.com");
        assertThat(html).contains("Professional Summary");
        assertThat(html).contains("Experience");
        assertThat(html).contains("Projects");
        assertThat(html).contains("Education");
        assertThat(html).contains("Technical Skills");
        assertThat(html).contains("Strengths");
        assertThat(html).contains("Languages");
        assertThat(html).contains("Declaration");

        // Verify Experience and Projects come before Education in the section markup
        int expIndex = html.indexOf("<div class=\"section-title\">Experience</div>");
        int projIndex = html.indexOf("<div class=\"section-title\">Projects</div>");
        int eduIndex = html.indexOf("<div class=\"section-title\">Education</div>");
        assertThat(expIndex).isGreaterThan(0);
        assertThat(projIndex).isGreaterThan(0);
        assertThat(eduIndex).isGreaterThan(0);
        assertThat(expIndex).isLessThan(eduIndex);
        assertThat(projIndex).isLessThan(eduIndex);
    }

    @Test
    void techAtsTemplate_rendersSingleColumnAtsHtml() {
        Resume resume = createSampleResume();
        String html = techAtsTemplate.render(resume);

        assertThat(html).isNotNull();
        assertThat(html).contains("<header");
        assertThat(html).contains("<section");
        assertThat(html).contains("Alex Rivera");
        assertThat(html).contains("Software Engineering Student");
        assertThat(html).contains("Professional Summary");
        assertThat(html).contains("Experience");
        assertThat(html).contains("Projects");
        assertThat(html).contains("Education");
        assertThat(html).contains("Technical Skills");
        assertThat(html).contains("Strengths");
        assertThat(html).contains("Declaration");

        // Verify Experience and Projects come before Education in the ATS section markup
        int expIndex = html.indexOf("<h2 class=\"section-title\">Experience</h2>");
        int projIndex = html.indexOf("<h2 class=\"section-title\">Projects</h2>");
        int eduIndex = html.indexOf("<h2 class=\"section-title\">Education</h2>");
        assertThat(expIndex).isGreaterThan(0);
        assertThat(projIndex).isGreaterThan(0);
        assertThat(eduIndex).isGreaterThan(0);
        assertThat(expIndex).isLessThan(eduIndex);
        assertThat(projIndex).isLessThan(eduIndex);
    }

    @Test
    void emeraldSidebarTemplate_rendersPhotoAndSidebarHtml() {
        Resume resume = createSampleResume();
        resume.getPersonalInfo().setPhotoUrl("https://example.com/avatar.jpg");
        String html = emeraldSidebarTemplate.render(resume);

        assertThat(html).isNotNull();
        assertThat(html).contains("class=\"sidebar\"");
        assertThat(html).contains("class=\"profile-photo\"");
        assertThat(html).contains("https://example.com/avatar.jpg");
        assertThat(html).contains("Alex Rivera");
        assertThat(html).contains("Software Engineering Student");
        assertThat(html).contains("Summary");
        assertThat(html).contains("Education");
        assertThat(html).contains("Experience");
        assertThat(html).contains("Projects");
        assertThat(html).contains("Skills");
        assertThat(html).contains("Languages");
    }
}

import type { FullResumeResponse } from '@/types/api'

/**
 * Showcase sample data used to render rich template previews on the
 * standalone /templates gallery, reached outside any specific resume.
 * Features a high-achieving student software engineer persona with
 * 2 internships, 3 featured projects, certifications, achievements,
 * categorized technical skills, and language proficiencies.
 */
export const sampleResume: FullResumeResponse = {
  resume: {
    id: 'sample',
    title: 'Software Engineering Student & Full-Stack Developer',
    status: 'IN_PROGRESS',
    summary:
      'Computer Science undergraduate and passionate software engineer with hands-on experience developing distributed systems, high-performance RESTful APIs, and cloud-native web applications. Proven track record across two software engineering internships designing microservices, optimizing relational databases, and architecting real-time event-driven pipelines. Experienced in Java, Python, TypeScript, Spring Boot, React, and containerized cloud architectures with Docker and Kubernetes.',
    declaration:
      'I hereby declare that all the information provided above is true and authentic to the best of my knowledge.',
    strengths:
      'Strong analytical and algorithmic problem-solving mindset\nQuick learner who proactively masters emerging technologies and frameworks\nCollaborative team player experienced in cross-functional agile development\nMeticulous attention to code quality, security, and performance optimization\nDedicated to continuous improvement and knowledge sharing',
  },
  personalInfo: {
    id: 'sample-personal',
    fullName: 'Alex Rivera',
    jobTitle: 'Software Engineering Student',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 739-2841',
    location: 'San Francisco, CA, United States',
    linkedinUrl: 'https://linkedin.com/in/alexrivera-dev',
    githubUrl: 'https://github.com/alexrivera-dev',
    portfolioUrl: 'https://alexrivera.dev',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  education: [
    {
      id: 'sample-edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. Computer Science & Engineering',
      fieldOfStudy: 'Computer Science',
      grade: '3.92 / 4.0 (Dean’s Honors List)',
      startDate: '2021-08-01',
      endDate: null,
    },
    {
      id: 'sample-edu-2',
      institution: 'Westfield High School',
      degree: 'High School Honors Diploma',
      fieldOfStudy: 'Advanced Placement (AP) Computer Science & Calculus',
      grade: '4.0 / 4.0 (Valedictorian)',
      startDate: '2017-08-01',
      endDate: '2021-05-01',
    },
  ],
  experience: [
    {
      id: 'sample-exp-1',
      company: 'Apex Cloud Systems',
      jobTitle: 'Software Engineering Intern',
      description:
        'Engineered distributed event-driven microservices using Java 21, Spring Boot, and Apache Kafka, processing 1.5M+ daily transaction events with 99.99% uptime.\nDesigned and deployed high-throughput PostgreSQL query optimization strategies and Redis caching layers, reducing p95 read latency from 220ms to 28ms.\nAuthored comprehensive unit and integration test suites with JUnit 5, Mockito, and Testcontainers, elevating code coverage from 68% to 92%.',
      startDate: '2024-06-01',
      endDate: null,
      currentlyWorking: true,
    },
    {
      id: 'sample-exp-2',
      company: 'NovaTech Labs',
      jobTitle: 'Backend Developer Intern',
      description:
        'Architected secure RESTful APIs with JWT authentication, role-based access control (RBAC), and rate-limiting using Spring Security and Bucket4j.\nContainerized multi-service development environments using Docker and Docker Compose, reducing local onboarding setup time by 75%.\nCollaborated in an agile scrum team to build CI/CD deployment pipelines on AWS (ECS, S3, RDS), automating staging and production releases.',
      startDate: '2023-05-01',
      endDate: '2023-12-01',
      currentlyWorking: false,
    },
  ],
  projects: [
    {
      id: 'sample-proj-1',
      title: 'CloudPulse — Distributed Microservices & Metrics Engine',
      description:
        'Architected an end-to-end cloud monitoring platform using Spring Cloud, Go, and React TypeScript to track system telemetry and application health across distributed nodes.\nIntegrated WebSocket feeds for live dashboard metric streaming with sub-50ms latency backed by Redis Pub/Sub and TimescaleDB for time-series persistence.\nContainerized all microservices with Kubernetes Helm charts and implemented automated Grafana alerting triggers.',
      githubUrl: 'https://github.com/alexrivera-dev/cloudpulse',
      demoUrl: 'https://cloudpulse-demo.dev',
      startDate: '2024-01-01',
      endDate: '2024-05-01',
      currentlyBuilding: false,
    },
    {
      id: 'sample-proj-2',
      title: 'AI Document & Audio Intelligence Hub',
      description:
        'Developed a full-stack multimodal document and audio processing platform using Java, Python FastAPI, and Google Gemini API for automated transcription, AI noise reduction, and semantic search.\nBuilt vector embedding search pipeline using pgvector and PostgreSQL to enable instant natural language querying across 10,000+ technical documents.\nCrafted a responsive, modern web UI in Next.js 14 and TailwindCSS with real-time audio waveform visualization and PDF document export.',
      githubUrl: 'https://github.com/alexrivera-dev/audio-intelligence',
      demoUrl: 'https://audio-hub.dev',
      startDate: '2023-10-01',
      endDate: '2024-02-01',
      currentlyBuilding: false,
    },
    {
      id: 'sample-proj-3',
      title: 'ResumeForge — Full-Stack AI Resume Engine & Vector PDF Exporter',
      description:
        'Engineered a production-ready resume building suite with Spring Boot 3 backend, dynamic Thymeleaf & OpenHTMLtoPDF vector engines, and React 19 client.\nImplemented on-canvas live WYSIWYG paper editing with bidirectional synchronization, keyboard shortcuts (Ctrl+S), and instant multi-template switching.\nIntegrated AI-assisted section tailoring, automated ATS compatibility scoring, and cloud storage persistence.',
      githubUrl: 'https://github.com/alexrivera-dev/resumeforge',
      demoUrl: 'https://resumeforge.dev',
      startDate: '2024-02-01',
      endDate: null,
      currentlyBuilding: true,
    },
  ],
  skills: [
    { id: 'sample-skill-1', name: 'Programming Languages: Java, Python, TypeScript, JavaScript, C++, Go, SQL, HTML5, CSS3' },
    { id: 'sample-skill-2', name: 'Backend Technologies: Spring Boot 3, Spring Security, REST APIs, Microservices, Hibernate ORM, FastAPI' },
    { id: 'sample-skill-3', name: 'Frontend Technologies: React.js, Next.js, Vite, TailwindCSS, Redux Toolkit, Zustand' },
    { id: 'sample-skill-4', name: 'Databases & Storage: PostgreSQL, MySQL, Redis, MongoDB, pgvector' },
    { id: 'sample-skill-5', name: 'Cloud & DevOps: AWS (S3, ECS, EC2, Lambda), Docker, Kubernetes, CI/CD Actions, NGINX' },
    { id: 'sample-skill-6', name: 'Testing & Quality: JUnit 5, Mockito, Testcontainers, Postman, Jest, Cypress' },
    { id: 'sample-skill-7', name: 'Core Concepts: OOP, System Design, Data Structures & Algorithms, Concurrency, Microservices Architecture' },
  ],
  certifications: [
    {
      id: 'sample-cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuingOrganization: 'Amazon Web Services (AWS)',
      issueDate: '2023-10-01',
      expirationDate: null,
      credentialId: 'AWS-SAA-83921',
      credentialUrl: null,
    },
    {
      id: 'sample-cert-2',
      name: 'Oracle Certified Professional: Java SE 17 Developer',
      issuingOrganization: 'Oracle',
      issueDate: '2024-01-01',
      expirationDate: null,
      credentialId: 'OCP-JAVA-90142',
      credentialUrl: null,
    },
  ],
  achievements: [
    {
      id: 'sample-ach-1',
      title: '1st Place Winner — HackMIT National Hackathon (2024)',
      description: 'Built a distributed disaster response routing algorithm in 36 hours competing against 250+ teams.',
      issuer: 'Massachusetts Institute of Technology (MIT)',
      achievementDate: '2024-09-01',
    },
    {
      id: 'sample-ach-2',
      title: 'Top 1% Global Ranking — LeetCode & Competitive Programming',
      description: 'Solved 600+ algorithmic problems with rating 2150+ (Knight tier); ranked in top 1% of global participants.',
      issuer: 'LeetCode',
      achievementDate: '2024-04-01',
    },
    {
      id: 'sample-ach-3',
      title: 'President’s Academic Excellence Scholar',
      description: 'Full-tuition merit scholarship awarded for academic distinction in computer science and engineering.',
      issuer: 'University of California, Berkeley',
      achievementDate: '2021-08-01',
    },
  ],
  languages: [
    { id: 'sample-lang-1', languageName: 'English', proficiencyLevel: 'NATIVE' },
    { id: 'sample-lang-2', languageName: 'Spanish', proficiencyLevel: 'FLUENT' },
    { id: 'sample-lang-3', languageName: 'German', proficiencyLevel: 'CONVERSATIONAL' },
  ],
}

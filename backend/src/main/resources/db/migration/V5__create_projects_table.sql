CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_resume_id ON projects(resume_id);

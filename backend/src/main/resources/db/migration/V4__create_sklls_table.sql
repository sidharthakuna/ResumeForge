CREATE TABLE skills (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                        name VARCHAR(100) NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT now(),
                        updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_skills_resume_id ON skills(resume_id);
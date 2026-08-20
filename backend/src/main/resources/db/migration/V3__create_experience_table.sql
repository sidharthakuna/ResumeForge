CREATE TABLE experience (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                            company VARCHAR(150) NOT NULL,
                            job_title VARCHAR(150) NOT NULL,
                            description TEXT,
                            start_date DATE NOT NULL,
                            end_date DATE,
                            currently_working BOOLEAN NOT NULL DEFAULT false,
                            created_at TIMESTAMP NOT NULL DEFAULT now(),
                            updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_experience_resume_id ON experience(resume_id);
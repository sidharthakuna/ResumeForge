-- V9__create_certifications_table.sql
CREATE TABLE certifications (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                                name VARCHAR(150) NOT NULL,
                                issuing_organization VARCHAR(150) NOT NULL,
                                issue_date DATE NOT NULL,
                                expiration_date DATE,
                                credential_id VARCHAR(100),
                                credential_url VARCHAR(500),
                                created_at TIMESTAMP NOT NULL DEFAULT now(),
                                updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_certifications_resume_id ON certifications(resume_id);
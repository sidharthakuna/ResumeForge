--V8_create_generated_resume_table.sql
CREATE TABLE generated_resumes (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                   resume_id UUID NOT NULL
                                       REFERENCES resumes(id)
                                           ON DELETE CASCADE,

                                   storage_identifier VARCHAR(500) NOT NULL,

                                   template VARCHAR(50) NOT NULL,

                                   created_at TIMESTAMP NOT NULL DEFAULT now(),

                                   updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_resumes_resume_id
    ON generated_resumes(resume_id);
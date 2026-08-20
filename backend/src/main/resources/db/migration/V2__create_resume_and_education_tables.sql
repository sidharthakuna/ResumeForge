CREATE TABLE resumes (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id UUID NOT NULL REFERENCES users(id),
                         title VARCHAR(150) NOT NULL,
                         status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                         snapshot_data TEXT,
                         created_at TIMESTAMP NOT NULL DEFAULT now(),
                         updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE education (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                           institution VARCHAR(150) NOT NULL,
                           degree VARCHAR(100) NOT NULL,
                           field_of_study VARCHAR(100),
                           start_date DATE NOT NULL,
                           end_date DATE,
                           created_at TIMESTAMP NOT NULL DEFAULT now(),
                           updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_education_resume_id ON education(resume_id);
-- V10__create_achievements_and_languages_tables.sql
CREATE TABLE achievements (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                              title VARCHAR(200) NOT NULL,
                              description TEXT,
                              issuer VARCHAR(150),
                              achievement_date DATE NOT NULL,
                              created_at TIMESTAMP NOT NULL DEFAULT now(),
                              updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_achievements_resume_id ON achievements(resume_id);

CREATE TABLE languages (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                           language_name VARCHAR(100) NOT NULL,
                           proficiency_level VARCHAR(20) NOT NULL,
                           created_at TIMESTAMP NOT NULL DEFAULT now(),
                           updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_languages_resume_id ON languages(resume_id);
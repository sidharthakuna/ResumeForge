-- V7__create_personal_info_table.sql
CREATE TABLE personal_info (
                               id UUID PRIMARY KEY REFERENCES resumes(id) ON DELETE CASCADE,
                               full_name VARCHAR(100) NOT NULL,
                               email VARCHAR(255) NOT NULL,
                               phone VARCHAR(20),
                               location VARCHAR(150),
                               linkedin_url VARCHAR(500),
                               portfolio_url VARCHAR(500),
                               created_at TIMESTAMP NOT NULL DEFAULT now(),
                               updated_at TIMESTAMP NOT NULL DEFAULT now()
);
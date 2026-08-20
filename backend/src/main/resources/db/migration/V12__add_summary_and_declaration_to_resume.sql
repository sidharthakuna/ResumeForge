-- V12__add_summary_and_declaration_to_resumes.sql
ALTER TABLE resumes
    ADD COLUMN summary TEXT,
    ADD COLUMN declaration TEXT;
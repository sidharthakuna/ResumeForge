-- V18: Add photo_url to personal_info for resume-specific photo templates
ALTER TABLE personal_info
    ADD COLUMN photo_url TEXT;

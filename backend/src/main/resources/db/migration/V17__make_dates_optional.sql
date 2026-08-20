-- Make date columns optional across education, experience, certifications, and achievements
ALTER TABLE education ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE experience ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE certifications ALTER COLUMN issue_date DROP NOT NULL;
ALTER TABLE achievements ALTER COLUMN achievement_date DROP NOT NULL;

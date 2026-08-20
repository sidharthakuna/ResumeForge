-- V11__add_frontend_template_name_to_generated_resumes.sql
--
-- The existing `template` column is tied to the backend's ResumeTemplate
-- enum (MODERN/CLASSIC/PROFESSIONAL), which drove Java-side Thymeleaf
-- rendering under the original architecture. Since PDF generation moved to
-- accepting HTML the frontend renders itself (see generate-from-html), the
-- backend has no real way to know which of the FRONTEND's own templates
-- was used -- the old enum doesn't describe that at all.
--
-- This adds a separate, nullable, free-text column the frontend can
-- populate with its own template's name/id (e.g. "ats-safe-v1",
-- "professional-sidebar") without being constrained to the backend enum.
-- Nullable because the original generate() endpoint (still using
-- Thymeleaf) has no such concept and will simply leave this null.
ALTER TABLE generated_resumes
    ADD COLUMN frontend_template_name VARCHAR(100);

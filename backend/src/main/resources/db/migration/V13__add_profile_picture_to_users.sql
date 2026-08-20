-- Add profile_picture_path column to users table.
-- Nullable because existing users have no photo yet;
-- the application layer treats NULL as "no photo set" and falls back
-- to the initials avatar on the frontend.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_picture_path VARCHAR(500);

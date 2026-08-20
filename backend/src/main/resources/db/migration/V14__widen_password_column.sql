-- Widen the password column to safely accommodate all BCrypt hash variants.
-- Standard $2a$ produces exactly 60 chars, but $2b$ and $2y$ variants
-- used by some implementations can be slightly longer. 72 is the safe max.
ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(72);

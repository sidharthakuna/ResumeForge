-- Create email_otps table for registration verification and password reset flows
CREATE TABLE email_otps (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_email_otps_email_purpose ON email_otps(email, purpose);
CREATE INDEX idx_email_otps_created_at ON email_otps(created_at);

-- Add OAuth and authentication provider columns to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    ADD COLUMN IF NOT EXISTS google_sub_id VARCHAR(255);

-- Allow password to be nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

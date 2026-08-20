CREATE TABLE users (
                       id UUID PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(60) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       role VARCHAR(20) NOT NULL,
                       email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at TIMESTAMP NOT NULL,
                       updated_at TIMESTAMP NOT NULL
);
package com.resumebuilder.common.exception;

/**
 * Wraps any failure from the storage backend (S3 upload/download/delete
 * error, network failure, missing object, permissions issue) so it's
 * distinguishable from a bug in our own code. Thrown by S3StorageService
 * (and can be thrown by LocalStorageService too if desired later), caught
 * by GlobalExceptionHandler and surfaced as 502 -- same treatment as
 * AiGenerationException for an external-dependency failure.
 */
public class StorageException extends RuntimeException {
    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
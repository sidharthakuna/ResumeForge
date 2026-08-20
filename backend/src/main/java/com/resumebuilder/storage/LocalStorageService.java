package com.resumebuilder.storage;

import com.resumebuilder.common.exception.StorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

// Only active when storage.provider=local (the default -- see
// application.yaml's "storage.provider: local"). Kept for local dev,
// where there's no S3 bucket to point at. See S3StorageService for the
// Render-deployed path, which survives container restarts; this one
// does not, since Render's filesystem is wiped on every redeploy.
@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final Path basePath;

    public LocalStorageService(@Value("${storage.local.base-path}") String basePath) {
        this.basePath = Path.of(basePath);
        try {
            Files.createDirectories(this.basePath);
        } catch (IOException e) {
            // Startup-time failure, not a per-request one -- there's no
            // HTTP request in flight yet for GlobalExceptionHandler to
            // catch, so this intentionally stays UncheckedIOException.
            // Spring wraps it into a BeanCreationException and refuses to
            // start the app, which is the right behavior: better to fail
            // loudly at boot than silently accept requests it can't
            // actually persist.
            throw new UncheckedIOException("Failed to create storage directory: " + basePath, e);
        }
    }

    @Override
    public String store(UUID generatedResumeId, byte[] pdfBytes) {

        String fileName = generatedResumeId + ".pdf";
        Path filePath = basePath.resolve(fileName);

        try {
            Files.write(filePath, pdfBytes);
        } catch (IOException e) {
            throw new StorageException("Failed to write PDF file: " + filePath, e);
        }

        return filePath.toString();
    }

    @Override
    public byte[] retrieve(String storageIdentifier) {
        try {
            return Files.readAllBytes(Path.of(storageIdentifier));
        } catch (IOException e) {
            throw new StorageException("Failed to read PDF file: " + storageIdentifier, e);
        }
    }

    @Override
    public void delete(String storageIdentifier) {
        try {
            Files.deleteIfExists(Path.of(storageIdentifier));
        } catch (IOException e) {
            throw new StorageException("Failed to delete PDF file: " + storageIdentifier, e);
        }
    }
}
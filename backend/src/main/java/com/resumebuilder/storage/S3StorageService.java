package com.resumebuilder.storage;

import com.resumebuilder.common.exception.StorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.net.URI;
import java.util.UUID;

/**
 * S3-compatible storage for generated resume PDFs. Works against real AWS
 * S3 or any S3-compatible provider (Cloudflare R2, Backblaze B2) by
 * pointing storage.s3.endpoint at that provider's endpoint URL -- both
 * expose the same S3 API surface, so no code here is AWS-specific beyond
 * the SDK itself.
 *
 * Why this exists: Render's filesystem is ephemeral -- LocalStorageService
 * (writing to ./generated-pdfs on local disk) loses every file on every
 * redeploy or container restart. This fixes that by storing bytes in a
 * bucket instead, which survives restarts and redeploys.
 *
 * Only active when storage.provider=s3 (see @ConditionalOnProperty below).
 * LocalStorageService remains the default for local dev via
 * storage.provider=local, so nothing about the local workflow changes --
 * this only needs configuring once you actually deploy.
 *
 * storageIdentifier here is the S3 object key (e.g.
 * "generated-resumes/<uuid>.pdf"), not a full URL -- StorageService's
 * contract treats it as an opaque string handed back to retrieve()/
 * delete() later, and every call site in the codebase (ResumeService,
 * ResumeGenerationServiceImpl, GeneratedResume.storageIdentifier) already
 * respects that, so a short key fits the existing default-length String
 * column with room to spare.
 */
@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "s3")
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final String bucketName;

    // Keys are prefixed so this bucket can be reused for other file types
    // later without a naming collision, and so a bucket listing is
    // immediately readable (matches the LocalStorageService convention of
    // "<uuid>.pdf" but namespaced, since a bucket is flatter than a
    // directory tree and has no natural "generated-pdfs/" folder of its
    // own the way a local base-path does).
    private static final String KEY_PREFIX = "generated-resumes/";

    public S3StorageService(
            @Value("${storage.s3.bucket-name}") String bucketName,
            @Value("${storage.s3.region}") String region,
            @Value("${storage.s3.access-key}") String accessKey,
            @Value("${storage.s3.secret-key}") String secretKey,
            @Value("${storage.s3.endpoint:}") String endpoint) {

        this.bucketName = bucketName;

        var credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentials);

        // endpoint is only set for S3-compatible providers (R2, B2).
        // Real AWS S3 resolves its endpoint from the region alone, so
        // this stays blank for that case -- leaving it unset lets the SDK
        // build the standard AWS endpoint itself rather than us
        // hand-constructing a URL that could drift from AWS's own
        // region-to-endpoint mapping.
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        this.s3Client = builder.build();
    }

    @Override
    public String store(UUID generatedResumeId, byte[] pdfBytes) {
        String key = KEY_PREFIX + generatedResumeId + ".pdf";

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("application/pdf")
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(pdfBytes));
        } catch (S3Exception e) {
            throw new StorageException("Failed to upload PDF to S3: " + key, e);
        }

        return key;
    }

    @Override
    public byte[] retrieve(String storageIdentifier) {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageIdentifier)
                    .build();

            return s3Client.getObjectAsBytes(request).asByteArray();
        } catch (S3Exception e) {
            // Catches both "object not found" and genuine failures (auth,
            // network, permissions) under one branch. AWS's own official
            // SDK examples do the same (catch S3Exception broadly, not
            // NoSuchKeyException specifically) -- and that choice matters
            // more here than it would for AWS-only code, since this class
            // is also meant to run against S3-compatible providers
            // (Cloudflare R2, Backblaze B2) whose exception behavior for
            // a missing key isn't guaranteed to match AWS's exactly.
            throw new StorageException("Failed to retrieve PDF from S3: " + storageIdentifier, e);
        }
    }

    @Override
    public void delete(String storageIdentifier) {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageIdentifier)
                    .build();

            s3Client.deleteObject(request);
        } catch (S3Exception e) {
            // Mirrors LocalStorageService's Files.deleteIfExists semantics
            // (delete-if-present, not delete-or-throw-on-missing) --
            // NoSuchKeyException is NOT caught here because
            // DeleteObjectRequest, unlike GetObjectRequest, does not throw
            // on a missing key in S3's API (delete is idempotent by
            // design). Only genuine failures (auth, network, permissions)
            // reach this catch block.
            throw new StorageException("Failed to delete PDF from S3: " + storageIdentifier, e);
        }
    }
}
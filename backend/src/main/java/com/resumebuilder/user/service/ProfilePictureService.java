package com.resumebuilder.user.service;

import com.resumebuilder.common.exception.StorageException;
import com.resumebuilder.common.security.AuthenticationFacade;
import com.resumebuilder.user.entity.User;
import com.resumebuilder.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

/**
 * Handles all profile-picture operations: upload, delete, serve.
 *
 * Images are stored on disk under {@code storage.avatars.base-path}
 * (defaults to {@code ./uploads/avatars}) using the pattern
 * {@code <userId>.<extension>}. One file per user — uploading a new
 * photo always replaces the old one. The column stores only the relative
 * file name (e.g. "abc123.jpg"), not the full path, so moving the
 * base-path directory never invalidates stored references.
 *
 * Size and content-type are validated here, NOT in the controller,
 * because the controller should stay thin (routing only). File-type
 * sniffing is intentionally done via the reported MIME type from the
 * client; for a production system with higher security requirements
 * you would additionally sniff magic bytes (e.g. via Apache Tika).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfilePictureService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private final AuthenticationFacade authenticationFacade;
    private final UserRepository userRepository;

    @Value("${storage.avatars.base-path:./uploads/avatars}")
    private String basePath;

    // ------------------------------------------------------------------ //
    //  Upload                                                              //
    // ------------------------------------------------------------------ //

    @Transactional
    public String upload(MultipartFile file) {
        validateFile(file);

        User user = authenticationFacade.getCurrentUser();
        String extension = resolveExtension(file.getContentType());
        String fileName = user.getId() + "." + extension;

        Path dir = Path.of(basePath);
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new StorageException("Could not create avatar directory", e);
        }

        // Delete any previous avatar for this user (different extension) before writing.
        deleteExistingFile(dir, user.getId());

        Path destination = dir.resolve(fileName);
        try {
            file.transferTo(destination);
        } catch (IOException e) {
            throw new StorageException("Failed to save profile picture", e);
        }

        user.setProfilePicturePath(fileName);
        userRepository.save(user);
        log.debug("Profile picture saved for user {}: {}", user.getId(), fileName);
        return fileName;
    }

    // ------------------------------------------------------------------ //
    //  Delete                                                              //
    // ------------------------------------------------------------------ //

    @Transactional
    public void delete() {
        User user = authenticationFacade.getCurrentUser();
        if (user.getProfilePicturePath() == null) {
            return;
        }
        deleteExistingFile(Path.of(basePath), user.getId());
        user.setProfilePicturePath(null);
        userRepository.save(user);
        log.debug("Profile picture removed for user {}", user.getId());
    }

    // ------------------------------------------------------------------ //
    //  Serve (raw bytes)                                                   //
    // ------------------------------------------------------------------ //

    /**
     * Returns the raw image bytes for the current user's avatar, or
     * {@code null} if no avatar has been uploaded.
     */
    public byte[] getAvatarBytes(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getProfilePicturePath() == null) {
            return null;
        }
        Path filePath = Path.of(basePath).resolve(user.getProfilePicturePath());
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.warn("Could not read avatar for user {}: {}", user.getId(), e.getMessage());
            return null;
        }
    }

    /**
     * Returns the content-type for the stored avatar, derived from its extension.
     */
    public String getAvatarContentType(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getProfilePicturePath() == null) return "image/jpeg";
        String path = user.getProfilePicturePath();
        String ext = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1).toLowerCase() : "jpg";
        return switch (ext) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "gif" -> "image/gif";
            default -> "image/jpeg";
        };
    }

    // ------------------------------------------------------------------ //
    //  Public URL builder                                                  //
    // ------------------------------------------------------------------ //

    /**
     * Builds the public URL for the given user's avatar endpoint,
     * extracting the scheme+host from the current request so it works
     * in both local dev and production without hard-coding a base URL.
     */
    public static String buildAvatarUrl(HttpServletRequest request, UUID userId) {
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        boolean isDefaultPort = ("http".equals(scheme) && port == 80)
                || ("https".equals(scheme) && port == 443);
        String portSuffix = isDefaultPort ? "" : ":" + port;
        return scheme + "://" + host + portSuffix + "/api/users/" + userId + "/avatar";
    }

    // ------------------------------------------------------------------ //
    //  Internal helpers                                                    //
    // ------------------------------------------------------------------ //

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds the 5 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF");
        }

        // Deep binary inspection: verify the file's raw magic bytes match image format signatures
        try {
            byte[] header = file.getInputStream().readNBytes(12);
            if (!isValidImageHeader(header)) {
                throw new IllegalArgumentException("Uploaded file content does not match a valid image structure");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to inspect uploaded file content", e);
        }
    }

    private boolean isValidImageHeader(byte[] bytes) {
        if (bytes == null || bytes.length < 4) {
            return false;
        }

        // JPEG: FF D8 FF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return true;
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G'
                && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return true;
        }

        // GIF: GIF87a or GIF89a (47 49 46 38)
        if (bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == '8') {
            return true;
        }

        // WebP: RIFF (bytes 0..3) ... WEBP (bytes 8..11)
        if (bytes.length >= 12
                && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return true;
        }

        return false;
    }

    private String resolveExtension(String contentType) {
        if (contentType == null) return "jpg";
        return switch (contentType.toLowerCase()) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "jpg";
        };
    }

    /** Deletes all existing avatar files for the given userId (any extension). */
    private void deleteExistingFile(Path dir, UUID userId) {
        String prefix = userId.toString();
        try {
            if (Files.exists(dir)) {
                Files.list(dir)
                        .filter(p -> p.getFileName().toString().startsWith(prefix))
                        .forEach(p -> {
                            try {
                                Files.deleteIfExists(p);
                            } catch (IOException ex) {
                                log.warn("Could not delete old avatar file {}: {}", p, ex.getMessage());
                            }
                        });
            }
        } catch (IOException e) {
            log.warn("Could not scan avatar directory for cleanup: {}", e.getMessage());
        }
    }
}

package com.resumebuilder.storage;

import java.util.UUID;

public interface StorageService {

    String store(UUID generatedResumeId, byte[] bytes);

    byte[] retrieve(String storageIdentifier);

    void delete(String storageIdentifier);

}
package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LanguageRepository extends JpaRepository<Language, UUID> {

    Optional<Language> findByIdAndResumeUserId(
            UUID id,
            UUID userId
    );
}
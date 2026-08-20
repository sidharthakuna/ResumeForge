package com.resumebuilder.generation.repository;

import com.resumebuilder.generation.entity.GeneratedResume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GeneratedResumeRepository
        extends JpaRepository<GeneratedResume, UUID> {

    Optional<GeneratedResume> findByIdAndResumeUserId(
            UUID id,
            UUID userId
    );

    List<GeneratedResume> findAllByResumeIdAndResumeUserId(
            UUID resumeId,
            UUID userId
    );
}
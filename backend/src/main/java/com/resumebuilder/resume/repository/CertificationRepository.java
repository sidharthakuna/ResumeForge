package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CertificationRepository extends JpaRepository<Certification, UUID> {

    Optional<Certification> findByIdAndResumeUserId(
            UUID id,
            UUID userId
    );
}
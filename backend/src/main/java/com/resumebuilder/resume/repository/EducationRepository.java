package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EducationRepository extends JpaRepository<Education, UUID> {

    Optional<Education> findByIdAndResumeUserId(UUID id, UUID userId);

}
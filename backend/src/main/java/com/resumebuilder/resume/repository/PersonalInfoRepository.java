package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.PersonalInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PersonalInfoRepository extends JpaRepository<PersonalInfo, UUID> {

    Optional<PersonalInfo> findByIdAndResumeUserId(
            UUID id,
            UUID userId
    );
}
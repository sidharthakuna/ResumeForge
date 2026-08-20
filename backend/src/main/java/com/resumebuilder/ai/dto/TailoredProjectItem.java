package com.resumebuilder.ai.dto;

import java.util.List;
import java.util.UUID;

public record TailoredProjectItem(
        UUID projectId,
        String title,
        List<String> bullets,
        List<String> techStack
) {}

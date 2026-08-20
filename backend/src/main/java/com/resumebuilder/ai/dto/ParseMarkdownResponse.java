package com.resumebuilder.ai.dto;

import java.util.List;

public record ParseMarkdownResponse(
        String projectName,
        String summary,
        List<String> technologies,
        List<String> keyFeatures,
        List<String> architecturePoints,
        List<String> databaseAndApis
) {}

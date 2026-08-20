package com.resumebuilder.ai.dto;

import java.util.List;

public record AtsAnalysisResponse(
        int score,
        List<String> matchedKeywords,
        List<String> missingKeywords,
        List<String> suggestions,
        List<String> strengths,
        List<String> formattingWarnings
) {}

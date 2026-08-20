package com.resumebuilder.ai.dto;

import java.util.List;

public record ResumeTailoringResponse(
        String summary,
        List<TailoredExperienceItem> experience,
        List<TailoredProjectItem> projects,
        List<String> prioritizedSkills,
        List<String> matchedSkills,
        List<String> missingSkills,
        AtsAnalysisResponse atsAnalysis
) {}

package com.resumebuilder.template.dto;

import java.util.List;

public record TemplateListResponse(
        List<TemplateResponse> templates
) {
}
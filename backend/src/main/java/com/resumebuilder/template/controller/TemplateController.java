package com.resumebuilder.template.controller;

import com.resumebuilder.common.response.ApiResponse;
import com.resumebuilder.template.ResumeTemplate;
import com.resumebuilder.template.dto.TemplateListResponse;
import com.resumebuilder.template.dto.TemplateResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    @GetMapping
    public ApiResponse<TemplateListResponse> listTemplates() {
        List<TemplateResponse> templates = Arrays.stream(ResumeTemplate.values())
                .map(template -> new TemplateResponse(template.name(), template.getDisplayName()))
                .toList();

        return ApiResponse.success(new TemplateListResponse(templates));
    }
}
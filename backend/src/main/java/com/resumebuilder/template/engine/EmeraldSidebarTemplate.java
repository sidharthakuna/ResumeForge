package com.resumebuilder.template.engine;

import com.resumebuilder.resume.entity.Resume;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmeraldSidebarTemplate {

    private final ResumeHtmlTemplate htmlTemplate;

    public String render(Resume resume) {
        return htmlTemplate.renderEmeraldSidebar(resume);
    }
}

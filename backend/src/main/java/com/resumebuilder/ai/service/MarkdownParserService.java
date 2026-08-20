package com.resumebuilder.ai.service;

import com.resumebuilder.ai.dto.ParseMarkdownResponse;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MarkdownParserService {

    private static final Pattern TITLE_PATTERN = Pattern.compile("(?m)^#\\s+(.+)$");
    private static final Pattern HEADING_PATTERN = Pattern.compile("(?m)^#{1,4}\\s+(.+)$");
    private static final Pattern BULLET_PATTERN = Pattern.compile("(?m)^\\s*[-*+]\\s+(.+)$");
    private static final Pattern BADGE_IMAGE_PATTERN = Pattern.compile("\\[!\\[.*?\\]\\(.*?\\)\\]\\(.*?\\)|!\\[.*?\\]\\(.*?\\)");
    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile("```[\\s\\S]*?```");

    public ParseMarkdownResponse parse(String markdownContent) {
        if (markdownContent == null || markdownContent.isBlank()) {
            return new ParseMarkdownResponse("", "", List.of(), List.of(), List.of(), List.of());
        }

        String cleaned = BADGE_IMAGE_PATTERN.matcher(markdownContent).replaceAll("");
        String withoutCode = CODE_BLOCK_PATTERN.matcher(cleaned).replaceAll("");

        String projectName = extractProjectName(cleaned);
        String summary = extractOverview(withoutCode);
        List<String> technologies = extractSectionList(withoutCode, Set.of("tech", "technologies", "built with", "stack", "tools", "dependencies", "technology stack"));
        List<String> keyFeatures = extractSectionList(withoutCode, Set.of("features", "key features", "highlights", "capabilities", "functionality", "what it does"));
        List<String> architecturePoints = extractSectionList(withoutCode, Set.of("architecture", "design", "system design", "workflow", "data flow", "structure"));
        List<String> databaseAndApis = extractSectionList(withoutCode, Set.of("api", "apis", "endpoints", "database", "schema", "data model", "security", "authentication"));

        return new ParseMarkdownResponse(
                projectName,
                summary,
                technologies,
                keyFeatures,
                architecturePoints,
                databaseAndApis
        );
    }

    private String extractProjectName(String md) {
        Matcher m = TITLE_PATTERN.matcher(md);
        if (m.find()) {
            return cleanLine(m.group(1));
        }
        String[] lines = md.lines().map(String::trim).filter(s -> !s.isBlank()).toArray(String[]::new);
        return lines.length > 0 ? cleanLine(lines[0]) : "Project";
    }

    private String extractOverview(String md) {
        String[] lines = md.split("\\R");
        StringBuilder overview = new StringBuilder();
        boolean foundHeading = false;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("#")) {
                if (foundHeading) break;
                foundHeading = true;
                continue;
            }
            if (!trimmed.isBlank() && !trimmed.startsWith("-") && !trimmed.startsWith("*") && !trimmed.startsWith(">")) {
                overview.append(cleanLine(trimmed)).append(" ");
                if (overview.length() > 300) break;
            }
        }
        return overview.toString().trim();
    }

    private List<String> extractSectionList(String md, Set<String> targetKeywords) {
        List<String> results = new ArrayList<>();
        String[] lines = md.split("\\R");
        boolean inTargetSection = false;

        for (String line : lines) {
            String trimmed = line.trim();
            Matcher headingMatch = HEADING_PATTERN.matcher(trimmed);
            if (headingMatch.find()) {
                String headingText = headingMatch.group(1).toLowerCase().replaceAll("[^a-z0-9 ]", " ").trim();
                boolean matchesKeyword = targetKeywords.stream().anyMatch(kw -> headingText.contains(kw));
                inTargetSection = matchesKeyword;
                continue;
            }

            if (inTargetSection) {
                if (trimmed.startsWith("#")) {
                    inTargetSection = false;
                    continue;
                }
                Matcher bulletMatch = BULLET_PATTERN.matcher(trimmed);
                if (bulletMatch.find()) {
                    String item = cleanLine(bulletMatch.group(1));
                    if (!item.isBlank() && results.size() < 10) {
                        results.add(item);
                    }
                } else if (!trimmed.isBlank() && !trimmed.startsWith("```") && results.size() < 10) {
                    if (trimmed.contains(",")) {
                        for (String part : trimmed.split(",")) {
                            String p = cleanLine(part);
                            if (!p.isBlank() && p.length() < 60) {
                                results.add(p);
                            }
                        }
                    } else if (trimmed.length() < 120) {
                        results.add(cleanLine(trimmed));
                    }
                }
            }
        }
        return results;
    }

    private String cleanLine(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("[#*_`\\[\\]]", "")
                .replaceAll("<[^>]*>", "")
                .trim();
    }
}

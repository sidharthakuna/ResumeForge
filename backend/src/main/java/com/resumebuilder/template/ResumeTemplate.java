package com.resumebuilder.template;

public enum ResumeTemplate {
    MODERN("Modern"),
    CLASSIC("Classic"),
    EXECUTIVE_SERIF("Executive Serif"),
    NAVY_BANNER("Navy Banner"),
    SIDEBAR_MINIMALIST("Sidebar Minimalist"),
    MODERN_SPLIT("Modern Split"),
    TECH_MODERN("Tech Modern"),
    TECH_ATS("Tech ATS"),
    EMERALD_SIDEBAR("Emerald Sidebar");

    private final String displayName;

    ResumeTemplate(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
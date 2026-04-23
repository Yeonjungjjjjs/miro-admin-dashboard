"use client";

import { useMemo } from "react";
import { IconChatTwo } from "@mirohq/design-system-icons";
import { Text } from "@mirohq/design-system";

const STATIC_SUGGESTIONS = [
  // Bulk Operations
  "how do I bulk update team settings from public to private",
  "how do I change board sharing options across teams",
  "how do I promote users to full or advanced licenses",
  "how do I approve all pending license requests",
  "how do I review all insecure boards with sensitive content",
  // Analytics
  "who is the top user in this org",
  "what is the most used template",
  "how have credits been used",
  "what AI feature is used the most",
  // Search Links
  "go to public board sharing settings",
  "where is the setting for allowing Co-owner role",
  "where is the setting to allow MCP-compatible clients",
  "how do I connect SIEM to aggregate audit logs",
  "show me all teams that are set to private",
  "show me teams with only one admin",
  // Audit Log
  "show me the audit log for last week",
  "how many boards were created recently",
  "show failed login attempts",
  "show recent admin actions from the audit log",
  // Help Center
  "how do I set up MCPs for my organization",
  "how do I enable secure login for my organization",
  "how do I configure AI settings securely",
  "how do I follow my company's compliance guidelines in Miro",
  // General
  "show me inactive users",
  "show org analytics",
  "show billing and seat usage",
  "show security settings",
  "show AI feature configuration",
];

interface PromptSuggestionsProps {
  canvasState: { frames: any[]; orphans: any[]; arrows: any[] };
  inputValue: string;
  isVisible: boolean;
  onSelect: (text: string) => void;
  selectedIndex: number;
}

export function PromptSuggestions({
  canvasState,
  inputValue,
  isVisible,
  onSelect,
  selectedIndex,
}: PromptSuggestionsProps) {
  // Build context-aware suggestions from frame names
  const allSuggestions = useMemo(() => {
    const dynamic: string[] = [];
    const frameNames = canvasState.frames
      .map((f: any) => f.name || "")
      .filter(Boolean);

    for (const name of frameNames) {
      dynamic.push(`flesh out the ${name} section`);
      dynamic.push(`add more detail to ${name}`);
      dynamic.push(`redesign the ${name}`);
    }

    return [...STATIC_SUGGESTIONS, ...dynamic];
  }, [canvasState]);

  // Prefix-match filtering
  const filtered = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    if (!query) return [];
    return allSuggestions
      .filter((s) => s.toLowerCase().startsWith(query))
      .slice(0, 4);
  }, [allSuggestions, inputValue]);

  if (!isVisible || filtered.length === 0) return null;

  const query = inputValue.trim();

  return (
    <div
      className="absolute bottom-full mb-6 animate-suggestions-in"
      style={{
        right: -8,
        width: "calc(100% + 16px)",
      }}
    >
      <div
        style={{
          borderRadius: "var(--radii-200, 16px)",
          border: "1px solid var(--color-border-subtle, #E5E5E2)",
          background: "var(--color-background-primary, #fff)",
          boxShadow: "var(--shadow-elevated, 0 8px 24px rgba(0,0,0,0.12))",
          padding: "4px 0",
          overflow: "hidden",
        }}
      >
        {filtered.map((suggestion, i) => (
          <button
            type="button"
            key={suggestion}
            data-suggestion-index={i}
            data-suggestion-text={suggestion}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(suggestion);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              background: selectedIndex === i ? "var(--color-background-primary-hover, #f5f5f3)" : "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-background-primary-hover, #f5f5f3)"; }}
            onMouseLeave={(e) => { if (selectedIndex !== i) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <span style={{ color: "var(--color-content-secondary, #9CA3AF)", flexShrink: 0 }}>
              <IconChatTwo size="small" />
            </span>
            <Text size="normal" css={{ lineHeight: 1.4 }}>
              <span style={{ color: "var(--color-content-secondary, #9CA3AF)" }}>
                {suggestion.slice(0, query.length)}
              </span>
              <span style={{ fontWeight: 600, color: "var(--color-content-primary, #1a1a1a)" }}>
                {suggestion.slice(query.length)}
              </span>
            </Text>
          </button>
        ))}
      </div>
    </div>
  );
}

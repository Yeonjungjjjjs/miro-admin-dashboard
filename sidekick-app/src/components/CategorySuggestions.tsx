"use client";

import { IconArrowRight } from "@mirohq/design-system-icons";
import { CATEGORIES } from "@/data/guidedCategories";

interface CategorySuggestionsProps {
  isVisible: boolean;
  onSelect: (query: string) => void;
}

const hoverBg = "var(--color-background-primary-hover, #f0f0ed)";

export function CategorySuggestions({ isVisible, onSelect }: CategorySuggestionsProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute bottom-full mb-6 animate-suggestions-in"
      style={{ right: -8, width: "calc(100% + 16px)" }}
    >
      <div
        style={{
          borderRadius: "var(--radii-200, 16px)",
          border: "1px solid var(--color-border-subtle, #E5E5E2)",
          background: "var(--color-background-primary, #fff)",
          boxShadow: "var(--shadow-elevated, 0 8px 24px rgba(0,0,0,0.12))",
          overflow: "hidden",
          maxHeight: 360,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "4px 0" }}>
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(cat.label);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-content-secondary, #6b6b66)",
                }}
              >
                {cat.icon}
              </span>
              <span
                style={{
                  flex: 1,
                  fontFamily: "var(--font-families-body, 'Noto Sans', sans-serif)",
                  fontWeight: 500,
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: "var(--color-text-neutrals, #222428)",
                }}
              >
                {cat.label}
              </span>
              <span style={{ color: "var(--color-content-secondary, #6b6b66)", opacity: 0.4, flexShrink: 0 }}>
                <IconArrowRight css={{ width: 14, height: 14 }} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

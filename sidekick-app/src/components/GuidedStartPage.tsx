import { motion } from "framer-motion";
import {
  IconArrowRight,
} from "@mirohq/design-system-icons";
import { IconButton as MdsIconButton } from "@mirohq/design-system";
import { CATEGORIES } from "@/data/guidedCategories";

const cardStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "var(--spacing-200, 16px) var(--spacing-300, 24px)",
  background: "var(--color-background-canvas, #fafafc)",
  border: "1px solid var(--color-border-subtle, #e9eaef)",
  borderRadius: 20,
  cursor: "pointer",
  transition: "background 0.15s ease",
  overflow: "hidden",
  flexShrink: 0,
};

const hoverBg = "var(--color-background-primary-hover, #f0f0ed)";
const defaultBg = "var(--color-background-canvas, #fafafc)";

interface GuidedStartPageProps {
  onSubmit: (query: string) => void;
}

export function GuidedStartPage({ onSubmit }: GuidedStartPageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-100, 8px)",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", height: 20, flexShrink: 0, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-families-body, 'Noto Sans', sans-serif)",
              fontWeight: 600,
              fontSize: "var(--font-size-175, 14px)",
              lineHeight: 1,
              color: "var(--color-text-secondary, #42413a)",
              whiteSpace: "nowrap",
            }}
          >
            What can I help you with?
          </span>
        </div>

        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            role="button"
            tabIndex={0}
            onClick={() => onSubmit(cat.label)}
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(cat.label); }}
            style={cardStyle}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = defaultBg; }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-content-secondary, #6b6b66)",
              }}
            >
              {cat.icon}
            </span>
            <div style={{ flex: "1 0 0", minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-families-body, 'Noto Sans', sans-serif)",
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: 1.3,
                  color: "var(--color-text-neutrals, #222428)",
                }}
              >
                {cat.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-families-body, 'Noto Sans', sans-serif)",
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: "var(--color-text-secondary, #6b6b66)",
                  marginTop: 2,
                }}
              >
                {cat.description}
              </div>
            </div>
            <MdsIconButton aria-label={cat.label} variant="ghost" size="medium">
              <IconArrowRight />
            </MdsIconButton>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

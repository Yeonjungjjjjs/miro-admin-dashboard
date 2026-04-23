"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  IconArrowUp,
  IconCross,
} from "@mirohq/design-system-icons";
import { IconButton as MdsIconButton } from "@mirohq/design-system";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import Markdown from "react-markdown";
import { PromptSuggestions } from "../PromptSuggestions";
import { CategorySuggestions } from "../CategorySuggestions";
import { ICON_SIZE } from "./toolbar-constants";
import aiListeningAnimation from "./lottie/ai-listening.json";

function BlobIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width="27"
      height="26"
      viewBox="0 0 27 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <ellipse cx="6.55805" cy="12.8569" rx="3.53571" ry="8.59625" fill="currentColor" />
      <ellipse cx="13.1158" cy="12.857" rx="3.53571" ry="12.2207" fill="currentColor" />
      <ellipse cx="19.6737" cy="12.8569" rx="3.53571" ry="10.1568" fill="currentColor" />
    </svg>
  );
}

function VoiceHoverButton({ onClick }: { onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        lottieRef.current?.goToAndPlay(0);
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="flex shrink-0 items-center justify-center rounded-lg w-[36px] h-[36px] text-gray-900"
    >
      {isHovered ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={aiListeningAnimation}
          loop={false}
          autoplay
          style={{ width: 20, height: 23 }}
          onComplete={() => setIsHovered(false)}
        />
      ) : (
        <BlobIcon style={{ width: ICON_SIZE, height: ICON_SIZE }} />
      )}
    </button>
  );
}

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onFocusChange?: (focused: boolean) => void;
  onVoiceStart?: () => void;
  isLoading?: boolean;
  hasMessages?: boolean;
  hasPendingQuestion?: boolean;
  canvasState?: { frames: any[]; orphans: any[]; arrows: any[] };
  onSuggestionsVisibilityChange?: (visible: boolean) => void;
  onInputChange?: (hasText: boolean) => void;
  responseToast?: string | null;
  onDismissToast?: () => void;
  onOpenChat?: () => void;
  voiceState?: "idle" | "connecting" | "listening" | "speaking" | "error";
  activeCategory?: { label: string; icon: React.ReactNode } | null;
  onDismissCategory?: () => void;
}

const EMPTY_CANVAS = { frames: [], orphans: [], arrows: [] };

export function ChatInput({
  onSubmit,
  onFocusChange,
  onVoiceStart,
  isLoading = false,
  hasMessages = false,
  hasPendingQuestion = false,
  canvasState = EMPTY_CANVAS,
  onSuggestionsVisibilityChange,
  onInputChange,
  responseToast,
  onDismissToast,
  onOpenChat,
  voiceState = "idle",
  activeCategory = null,
  onDismissCategory,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const showSuggestions =
    isFocused &&
    !isLoading &&
    voiceState === "idle" &&
    value.trim().length > 0 &&
    !hasPendingQuestion;

  const showCategorySuggestions =
    isFocused &&
    !isLoading &&
    voiceState === "idle" &&
    value.trim().length === 0 &&
    !hasPendingQuestion;

  // Notify parent of suggestions visibility
  useEffect(() => {
    onSuggestionsVisibilityChange?.(showSuggestions);
  }, [showSuggestions, onSuggestionsVisibilityChange]);

  // Notify parent of input text
  useEffect(() => {
    onInputChange?.(value.trim().length > 0);
  }, [value, onInputChange]);

  // Reset suggestion index on value change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [value]);

  // Refocus after AI finishes
  useEffect(() => {
    if (!isLoading && isFocused) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoading]);

  const handleSuggestionSelect = useCallback(
    (text: string) => {
      onSubmit(text);
      setValue("");
      setSelectedSuggestionIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [onSubmit]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (selectedSuggestionIndex >= 0 && showSuggestions) return;
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
    setSelectedSuggestionIndex(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => Math.max(-1, prev - 1));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => prev + 1);
        return;
      }
      if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        const btn = document.querySelector(
          `[data-suggestion-index="${selectedSuggestionIndex}"]`
        ) as HTMLElement;
        if (btn) {
          const text = btn.getAttribute("data-suggestion-text");
          if (text) handleSuggestionSelect(text);
        }
        return;
      }
    }
  };

  return (
    <div className="relative">
      {/* Category suggestions when empty + focused */}
      {showCategorySuggestions && (
        <CategorySuggestions
          isVisible={showCategorySuggestions}
          onSelect={handleSuggestionSelect}
        />
      )}

      {/* Prompt suggestions when typing */}
      {showSuggestions && (
        <PromptSuggestions
          canvasState={canvasState}
          inputValue={value}
          isVisible={showSuggestions}
          onSelect={handleSuggestionSelect}
          selectedIndex={selectedSuggestionIndex}
        />
      )}

      {/* Response toast above */}
      {responseToast && !isLoading && (
        <div className="absolute bottom-full mb-4" style={{ right: -8, width: "calc(100% + 16px)" }}>
          <div className="w-full bg-white shadow-chrome border border-gray-200 overflow-hidden flex flex-col max-h-[300px] relative" style={{ borderRadius: 24 }}>
            {/* spacer for removed icon */}
            <div className="absolute top-3 right-3 z-10">
              <MdsIconButton
                aria-label="Dismiss"
                variant="ghost"
                size="medium"
                onPress={() => onDismissToast?.()}
              >
                <IconCross />
              </MdsIconButton>
            </div>
            {/* Scrollable content */}
            <div
              onClick={() => {
                onOpenChat?.();
                onDismissToast?.();
              }}
              className="overflow-y-auto p-4 pr-10 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="text-sm text-gray-700">
                <Markdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 mb-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 mb-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-0.5">{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-base font-semibold mt-3 mb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold mt-3 mb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mt-3 mb-2">
                        {children}
                      </h3>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-1 rounded text-xs">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {responseToast}
                </Markdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active category context chip */}
      {activeCategory && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            marginBottom: 8,
            background: "white",
            border: "1px solid #e0e2e8",
            borderRadius: 12,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              color: "#646b81",
              flexShrink: 0,
            }}
          >
            {activeCategory.icon}
          </span>
          <span
            style={{
              flex: 1,
              fontSize: 12,
              fontFamily: "'Inter', var(--font-families-main, 'Noto Sans', sans-serif)",
              fontWeight: 400,
              color: "#222428",
              lineHeight: 1.4,
            }}
          >
            {activeCategory.label}
          </span>
          <button
            type="button"
            onClick={onDismissCategory}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#959aac",
              padding: 0,
              flexShrink: 0,
              borderRadius: 4,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#222428"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#959aac"; }}
          >
            <IconCross css={{ width: 12, height: 12 }} />
          </button>
        </div>
      )}

      {/* Prompt bar — Figma 84-16370 */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            gap: "var(--spacing-100, 8px)",
            borderRadius: "var(--radii-200, 16px)",
            background: "var(--color-background-surface-secondary, #f1f2f5)",
            paddingTop: 4,
            paddingBottom: "var(--spacing-100, 8px)",
            paddingLeft: "var(--spacing-100, 8px)",
            paddingRight: "var(--spacing-100, 8px)",
          }}
        >
          {/* Text input area */}
          <div
            style={{
              flex: "1 0 0",
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              paddingLeft: "var(--spacing-100, 8px)",
              paddingRight: "var(--spacing-50, 4px)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (responseToast) onDismissToast?.();
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                onFocusChange?.(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                onFocusChange?.(false);
              }}
              placeholder={
                isLoading || hasMessages
                  ? "Reply..."
                  : "Enter your query"
              }
              disabled={isLoading}
              style={{
                flex: 1,
                background: "transparent",
                fontSize: 12,
                fontFamily: "'Inter', var(--font-families-main, 'Noto Sans', sans-serif)",
                fontWeight: 400,
                fontStyle: "normal",
                color: "var(--color-content-primary, #1a1a1a)",
                outline: "none",
                border: "none",
                minWidth: 0,
                lineHeight: "normal",
                opacity: isLoading ? 0.5 : 1,
              }}
            />
          </div>

          {/* Send button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
            <div
              style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (value.trim()) {
                    const form = inputRef.current?.closest("form");
                    if (form) form.requestSubmit();
                  }
                }}
                style={{
                  flex: "1 0 0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 0,
                  borderRadius: "var(--radii-150, 12px)",
                  background: "var(--color-background-inverted-secondary, #2a2923)",
                  padding: "0 var(--spacing-50, 4px)",
                  cursor: value.trim() ? "pointer" : "default",
                  opacity: value.trim() ? 1 : 0.4,
                  color: "white",
                  transition: "opacity 0.15s ease",
                }}
              >
                <IconArrowUp css={{ width: 16, height: 16 }} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

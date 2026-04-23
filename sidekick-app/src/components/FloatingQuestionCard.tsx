"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCross,
  IconArrowRight,
  IconSquarePencil,
  IconBoard,
} from "@mirohq/design-system-icons";
import { Button, IconButton as MdsIconButton } from "@mirohq/design-system";
import { hslToHex } from "@/lib/nav-palette";
import { apiFetch } from "@/lib/api";

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} minute${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${h} hour${h !== 1 ? "s" : ""}`;
  return `${h} hour${h !== 1 ? "s" : ""} ${m} minute${m !== 1 ? "s" : ""}`;
}

function TimeDial({
  maxMinutes,
  onChange,
}: {
  maxMinutes: number;
  onChange: (minutes: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const prevAngleRef = useRef(0); // Track previous angle for overflow prevention
  const [minutes, setMinutes] = useState(() => Math.round(maxMinutes / 2 / 5) * 5);

  // Layout constants
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const faceR = 82;      // Gold/gray filled circle
  const bezelInnerR = 83; // Inner edge of bezel ring
  const bezelOuterR = 90; // Outer edge of bezel ring
  const tickInnerR = 91;  // Ticks start just outside bezel
  const tickOuterR = 100; // Major tick end
  const tickOuterRSmall = 96; // Minor tick end

  const snap = (raw: number) => Math.max(5, Math.min(maxMinutes, Math.round(raw / 5) * 5));
  const minutesToAngle = (m: number) => (m / maxMinutes) * 360;
  const angleToMinutes = (deg: number) => {
    const normalized = ((deg % 360) + 360) % 360;
    return snap((normalized / 360) * maxMinutes);
  };

  // Pie wedge: from center to 12-o'clock, arc clockwise to endAngle, back to center
  const piePath = useCallback((endAngle: number) => {
    if (endAngle <= 0) return "";
    // At ~360° the arc collapses (start ≈ end), so use full circle instead
    const capped = Math.min(endAngle, 359.9);
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const r = faceR + 1;
    const sx = cx + r * Math.cos(toRad(0));
    const sy = cy + r * Math.sin(toRad(0));
    const ex = cx + r * Math.cos(toRad(capped));
    const ey = cy + r * Math.sin(toRad(capped));
    const large = capped > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
  }, [cx, cy]);

  const getAngleFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    return angle;
  }, [cx, cy]);

  // Set minutes from angle, with overflow clamping during drag.
  // Key: when clamped, DON'T update prevAngleRef — the user must drag
  // back into valid territory before the value moves again.
  const clampedRef = useRef<"min" | "max" | null>(null);

  const setMinutesFromAngle = useCallback((angle: number, isDrag: boolean) => {
    if (isDrag) {
      const prev = prevAngleRef.current;
      const delta = angle - prev;

      // If currently clamped, only unclamped when dragging back toward valid range
      if (clampedRef.current === "min") {
        // Clamped at min (near 0°) — only release if angle is in first quadrant (< 90°)
        if (angle > 270 || angle < 0.1) return; // still in overflow zone
        clampedRef.current = null;
      } else if (clampedRef.current === "max") {
        // Clamped at max (near 360°) — only release if angle is in last quadrant (> 270°)
        if (angle < 90 || angle > 359.9) return; // still in overflow zone
        clampedRef.current = null;
      }

      // Detect crossing 12 o'clock: large jump (>180°) means wrap-around
      if (delta > 180) {
        setMinutes(5);
        clampedRef.current = "min";
        return;
      } else if (delta < -180) {
        setMinutes(maxMinutes);
        clampedRef.current = "max";
        return;
      }
    }
    prevAngleRef.current = angle;
    clampedRef.current = null;
    setMinutes(angleToMinutes(angle));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxMinutes]);

  const handlePointerDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    setIsGrabbing(true);
    document.body.style.cursor = "grabbing";
    const angle = getAngleFromEvent(e);
    prevAngleRef.current = angle;
    setMinutesFromAngle(angle, false);
    e.preventDefault();
  }, [getAngleFromEvent, setMinutesFromAngle]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const angle = getAngleFromEvent(e);
      setMinutesFromAngle(angle, true);
    };
    const handleUp = () => {
      isDragging.current = false;
      setIsGrabbing(false);
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
    };
  }, [getAngleFromEvent, setMinutesFromAngle]);

  // Notify parent when value changes
  useEffect(() => { onChange(minutes); }, [minutes, onChange]);

  const currentAngle = minutesToAngle(minutes);

  // Ticks
  const totalTicks = 60;
  const tickStep = 360 / totalTicks;
  const majorEvery = 5;

  // Display
  const displayH = Math.floor(minutes / 60);
  const displayM = minutes % 60;
  const showHours = maxMinutes >= 60;
  const displayText = showHours
    ? `${String(displayH).padStart(2, "0")}:${String(displayM).padStart(2, "0")}`
    : `${minutes}`;
  const displayUnit = showHours ? "" : "min";

  return (
    <div className="flex flex-col items-center px-5 pb-2">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className={`${isGrabbing ? "cursor-grabbing" : "cursor-grab"} select-none`}
        onMouseDown={handlePointerDown}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Clip to circle for the pie wedge */}
          <clipPath id="td-face-clip">
            <circle cx={cx} cy={cy} r={faceR} />
          </clipPath>

          {/* Base gold flat fill for pie */}
          <radialGradient id="td-gold-base" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F2CA02" />
            <stop offset="100%" stopColor="#E8BC00" />
          </radialGradient>

          {/* 3D highlight overlay — strong white-to-transparent from top-left */}
          <radialGradient id="td-highlight" cx="30%" cy="25%" r="65%" fx="30%" fy="25%">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* 3D shadow overlay — dark from bottom-right */}
          <radialGradient id="td-shadow" cx="70%" cy="75%" r="60%" fx="70%" fy="75%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Gray face gradient for unfilled area */}
          <radialGradient id="td-gray-face" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#F7F7F7" />
            <stop offset="100%" stopColor="#EBEBEB" />
          </radialGradient>

          {/* Subtle drop shadow */}
          <filter id="td-shadow-filter" x="-15%" y="-10%" width="130%" height="135%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.10" />
          </filter>
          {/* Blur for specular highlight */}
          <filter id="td-highlight-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          {/* Soft blur for handle highlights */}
          <filter id="td-handle-blur" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        {/* === DIAL BODY === */}
        <g filter="url(#td-shadow-filter)">
          {/* Bezel ring — light gray ring around the face */}
          <circle cx={cx} cy={cy} r={bezelOuterR} fill="#E5E5E5" />
          <circle cx={cx} cy={cy} r={bezelInnerR} fill="#EEEEEE" />

          {/* Gray face (unfilled area) */}
          <circle cx={cx} cy={cy} r={faceR} fill="url(#td-gray-face)" />

          {/* Gold pie wedge — clipped to face circle */}
          {currentAngle > 1 && (
            <g clipPath="url(#td-face-clip)">
              {/* Flat gold base */}
              <path d={piePath(currentAngle)} fill="url(#td-gold-base)" />
              {/* 3D highlight overlay (top-left bright) */}
              <path d={piePath(currentAngle)} fill="url(#td-highlight)" />
              {/* 3D shadow overlay (bottom-right dark) */}
              <path d={piePath(currentAngle)} fill="url(#td-shadow)" />
            </g>
          )}

          {/* Specular highlight — blurry bright spot at top-left */}
          <ellipse
            cx={cx - 16}
            cy={cy - 20}
            rx={34}
            ry={24}
            fill="white"
            opacity={0.45}
            clipPath="url(#td-face-clip)"
            filter="url(#td-highlight-blur)"
            style={{ pointerEvents: "none" }}
          />

          {/* Inner border ring — visible stroke at face edge */}
          <circle cx={cx} cy={cy} r={faceR} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={8} />
        </g>

        {/* === TICK MARKS (outside bezel) === */}
        {Array.from({ length: totalTicks }, (_, i) => {
          const angle = i * tickStep;
          const rad = ((angle - 90) * Math.PI) / 180;
          const isMajor = i % majorEvery === 0;
          const outer = isMajor ? tickOuterR : tickOuterRSmall;
          return (
            <line
              key={i}
              x1={cx + tickInnerR * Math.cos(rad)}
              y1={cy + tickInnerR * Math.sin(rad)}
              x2={cx + outer * Math.cos(rad)}
              y2={cy + outer * Math.sin(rad)}
              stroke={isMajor ? "#AAAAAA" : "#CCCCCC"}
              strokeWidth={isMajor ? 1.5 : 0.75}
              strokeLinecap="round"
            />
          );
        })}

        {/* === RED HANDLE — 3D pill extending past tick marks === */}
        <g transform={`translate(${cx}, ${cy}) rotate(${currentAngle})`} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}>
          {/* Base shape */}
          <rect x={-3.5} y={-(tickOuterR + 4)} width={7} height={32} rx={3.5} fill="#E05A47" />
          {/* Highlight strip — lighter left edge for cylindrical 3D look */}
          <rect x={-3.5} y={-(tickOuterR + 4)} width={3.5} height={32} rx={2} fill="#EF7A6A" filter="url(#td-handle-blur)" />
          {/* Top cap highlight */}
          <rect x={-2} y={-(tickOuterR + 3)} width={4} height={4} rx={2} fill="#F4978B" opacity={0.7} filter="url(#td-handle-blur)" />
        </g>

        {/* === CENTER TIME TEXT === */}
        <text
          x={cx}
          y={showHours ? cy : cy - 4}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: 36,
            fontWeight: 700,
            fill: "#1F2937",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.01em",
          }}
        >
          {displayText}
        </text>
        {displayUnit && (
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: 13, fill: "#9CA3AF", fontFamily: "system-ui, sans-serif" }}
          >
            {displayUnit}
          </text>
        )}
      </svg>

      {/* Human-readable label */}
      <p className="text-sm text-gray-500 -mt-1">{formatTime(minutes)}</p>
    </div>
  );
}

function Counter({
  maxCount,
  onChange,
}: {
  maxCount: number;
  onChange: (count: number) => void;
}) {
  const [count, setCount] = useState(1);
  const directionRef = useRef(1); // 1 = up, -1 = down
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Notify parent via effect to avoid setState-during-render
  useEffect(() => { onChange(count); }, [count, onChange]);

  const increment = useCallback(() => {
    directionRef.current = 1;
    setCount(prev => Math.min(maxCount, prev + 1));
  }, [maxCount]);

  const decrement = useCallback(() => {
    directionRef.current = -1;
    setCount(prev => Math.max(1, prev - 1));
  }, []);

  // Hold-to-repeat
  const startHold = useCallback((fn: () => void) => {
    fn();
    const id = setInterval(fn, 120);
    holdRef.current = id;
  }, []);
  const stopHold = useCallback(() => {
    if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null; }
  }, []);
  useEffect(() => () => stopHold(), [stopHold]);

  return (
    <div className="flex flex-col items-center px-5 py-8">
      <div className="flex items-center gap-8">
        {/* Minus button */}
        <button
          onMouseDown={() => startHold(decrement)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={count <= 1}
          className="counter-btn relative w-14 h-14 rounded-full select-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(180deg, #F3F4F6 0%, #D1D5DB 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
        >
          <span
            className="absolute inset-[2px] rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)",
            }}
          >
            <svg width="20" height="3" viewBox="0 0 20 3"><rect width="20" height="3" rx="1.5" fill="#6B7280" /></svg>
          </span>
        </button>

        {/* Number display — odometer style, only changed digits animate */}
        <div
          className="flex items-center justify-center"
          style={{ width: 90, height: 52, gap: 4 }}
        >
          {String(count).split("").map((digit, i, arr) => (
            <div
              key={`pos-${arr.length - 1 - i}`}
              className="relative overflow-hidden"
              style={{ width: 28, height: 52 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={`${arr.length - 1 - i}-${digit}`}
                  className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-gray-900"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                  initial={{ y: directionRef.current * 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: directionRef.current * -28, opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                >
                  {digit}
                </motion.span>
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Plus button */}
        <button
          onMouseDown={() => startHold(increment)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={count >= maxCount}
          className="counter-btn relative w-14 h-14 rounded-full select-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(180deg, #F3F4F6 0%, #D1D5DB 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
        >
          <span
            className="absolute inset-[2px] rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="8.5" y="0" width="3" height="20" rx="1.5" fill="#6B7280" />
              <rect x="0" y="8.5" width="20" height="3" rx="1.5" fill="#6B7280" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

function ScaleBar({
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
  onSelect,
}: {
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  onSelect: (answer: string) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef(0);

  const formatAnswer = useCallback(
    (pct: number) => {
      // Convert percentage to a human-readable description
      if (pct < 0.15) return `Strongly ${leftLabel.toLowerCase()}`;
      if (pct < 0.3) return `Quite ${leftLabel.toLowerCase()}`;
      if (pct < 0.45) return `Leaning ${leftLabel.toLowerCase()}`;
      if (pct <= 0.55) return `Balanced between ${leftLabel.toLowerCase()} and ${rightLabel.toLowerCase()}`;
      if (pct < 0.7) return `Leaning ${rightLabel.toLowerCase()}`;
      if (pct < 0.85) return `Quite ${rightLabel.toLowerCase()}`;
      return `Strongly ${rightLabel.toLowerCase()}`;
    },
    [leftLabel, rightLabel]
  );

  return (
    <div className="px-5 pb-2">
      {/* Gradient bar */}
      <div
        ref={barRef}
        className="relative h-10 rounded-full cursor-pointer overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${leftColor || "#FCA5A5"}, ${rightColor || "#86EFAC"})`,
        }}
        onMouseMove={(e) => {
          if (!barRef.current || !circleRef.current) return;
          const rect = barRef.current.getBoundingClientRect();
          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          pctRef.current = pct;
          circleRef.current.style.left = `${pct * 100}%`;
          circleRef.current.style.opacity = "1";
        }}
        onMouseLeave={() => {
          if (circleRef.current) circleRef.current.style.opacity = "0";
        }}
        onClick={() => onSelect(formatAnswer(pctRef.current))}
      >
        {/* Hover preview circle — positioned via DOM, no React re-renders */}
        <div
          ref={circleRef}
          className="absolute top-1/2 w-6 h-6 rounded-full bg-white/70 border-2 border-white shadow-md pointer-events-none"
          style={{ transform: "translate(-50%, -50%)", opacity: 0 }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-2 px-1 text-sm text-gray-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function formatMatrixAnswer(
  x: number, y: number,
  leftLabel: string, rightLabel: string,
  topLabel: string, bottomLabel: string,
): string {
  const descX =
    x < 0.35
      ? `leaning ${leftLabel.toLowerCase()}`
      : x > 0.65
        ? `leaning ${rightLabel.toLowerCase()}`
        : `balanced ${leftLabel.toLowerCase()}/${rightLabel.toLowerCase()}`;
  const descY =
    y < 0.35
      ? `leaning ${topLabel.toLowerCase()}`
      : y > 0.65
        ? `leaning ${bottomLabel.toLowerCase()}`
        : `balanced ${topLabel.toLowerCase()}/${bottomLabel.toLowerCase()}`;
  return `${descY}, ${descX}`;
}

function MatrixGrid({
  topLabel,
  bottomLabel,
  leftLabel,
  rightLabel,
  posRef,
  onDragStateChange,
}: {
  topLabel: string;
  bottomLabel: string;
  leftLabel: string;
  rightLabel: string;
  posRef: React.MutableRefObject<{ x: number; y: number }>;
  onDragStateChange: (dragging: boolean) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const GRID_SIZE = 220;
  const DOT_SIZE = 32;
  const half = DOT_SIZE / 2;

  return (
    <div className="flex flex-col items-center px-5 pb-2">
      {/* Grid wrapper with labels */}
      <div className="relative" style={{ padding: "28px 40px" }}>
        {/* Top label */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-sm text-gray-400 font-medium">
          {topLabel}
        </div>
        {/* Bottom label */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm text-gray-400 font-medium">
          {bottomLabel}
        </div>
        {/* Left label */}
        <div
          className="absolute left-0 top-1/2 text-sm text-gray-400 font-medium"
          style={{
            writingMode: "vertical-rl",
            transform: "translateY(-50%) rotate(180deg)",
          }}
        >
          {leftLabel}
        </div>
        {/* Right label */}
        <div
          className="absolute right-0 top-1/2 text-sm text-gray-400 font-medium"
          style={{
            writingMode: "vertical-rl",
            transform: "translateY(-50%)",
          }}
        >
          {rightLabel}
        </div>

        {/* Grid area */}
        <div
          ref={gridRef}
          className="relative bg-gray-50 rounded-xl overflow-visible"
          style={{ width: GRID_SIZE, height: GRID_SIZE }}
        >
          {/* 3x3 grid lines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "1fr 1fr 1fr",
            }}
          >
            {Array.from({ length: 9 }, (_, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              return (
                <div
                  key={i}
                  style={{
                    borderRight: col < 2 ? "1px solid rgba(209,213,219,0.6)" : "none",
                    borderBottom: row < 2 ? "1px solid rgba(209,213,219,0.6)" : "none",
                  }}
                />
              );
            })}
          </div>

          {/* Draggable Miro-yellow dot — starts centered */}
          <motion.div
            drag
            dragConstraints={{
              left: -GRID_SIZE / 2 + half,
              right: GRID_SIZE / 2 - half,
              top: -GRID_SIZE / 2 + half,
              bottom: GRID_SIZE / 2 - half,
            }}
            dragElastic={0.15}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
            onDragStart={() => { setIsDragging(true); onDragStateChange(true); }}
            onDrag={(_, info) => {
              if (!gridRef.current) return;
              const rect = gridRef.current.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const absX = centerX + info.offset.x;
              const absY = centerY + info.offset.y;
              const xPct = Math.max(0, Math.min(1, (absX - rect.left) / rect.width));
              const yPct = Math.max(0, Math.min(1, (absY - rect.top) / rect.height));
              posRef.current = { x: xPct, y: yPct };
            }}
            onDragEnd={() => { setIsDragging(false); onDragStateChange(false); }}
            className="absolute rounded-full cursor-grab active:cursor-grabbing z-10"
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              left: GRID_SIZE / 2 - half,
              top: GRID_SIZE / 2 - half,
              background: "#F2CA02",
              border: "3px solid white",
              boxShadow: isDragging
                ? "0 8px 16px -2px rgba(0,0,0,0.18), 0 2px 6px -1px rgba(0,0,0,0.12)"
                : "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)",
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 1.1 }}
          />
        </div>
      </div>
    </div>
  );
}

function StylePicker({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (description: string) => void;
}) {
  const [images, setImages] = useState<(string | null | "error")[]>(() =>
    options.map(() => null)
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    options.forEach((desc, i) => {
      apiFetch("/api/styles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: desc }),
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          setImages((prev) => {
            const next = [...prev];
            next[i] = data.imageUrl;
            return next;
          });
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setImages((prev) => {
            const next = [...prev];
            next[i] = "error";
            return next;
          });
        });
    });

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-4 pb-2">
      <div className="grid grid-cols-2 gap-3">
        {options.map((desc, i) => {
          const img = images[i];
          const isSelected = selectedIndex === i;
          const isLoaded = typeof img === "string" && img !== "error";
          const isError = img === "error";

          return (
            <button
              key={i}
              onClick={() => {
                if (!isLoaded) return;
                setSelectedIndex(i);
                onSelect(desc);
              }}
              disabled={!isLoaded}
              className={`relative aspect-square rounded-xl overflow-hidden transition-all animate-slideInFromLeft ${
                isLoaded ? "cursor-pointer" : "cursor-default"
              } ${
                isSelected
                  ? "ring-3 ring-gray-900 ring-offset-2"
                  : isLoaded
                    ? "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                    : ""
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Skeleton loader — always present as base layer */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: isLoaded ? 0 : 1 }}
              >
                <div className="absolute inset-0 bg-gray-100" />
                <div
                  className="absolute inset-0 animate-pulse"
                  style={{
                    background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s ease-in-out infinite",
                  }}
                />
                {/* Faint centered icon placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 16l4.5-4.5a1 1 0 011.4 0L12 14.5l2.6-2.6a1 1 0 011.4 0L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Error state */}
              {isError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Failed</span>
                </div>
              )}

              {/* Loaded image — fades in from opacity 0 + blur 10px */}
              <img
                src={isLoaded ? img : undefined}
                alt={desc}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  filter: isLoaded ? "blur(0px)" : "blur(10px)",
                  transition: "opacity 0.6s ease-out, filter 0.6s ease-out",
                }}
              />

              {/* Bottom overlay with description — only visible when loaded */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-2 pt-6"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transition: "opacity 0.4s ease-out 0.2s",
                }}
              >
                <span className="text-white text-xs leading-tight line-clamp-2">
                  {desc}
                </span>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <svg
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function posToHex(x: number, y: number): string {
  const hue = x * 360;
  const saturation = 1 - y * 0.85; // top=100%, bottom=15%
  return hslToHex(hue, saturation, 0.5);
}

function ColorSpectrum({
  onSelect,
}: {
  onSelect: (hex: string) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.3 });
  const posRef = useRef({ x: 0.5, y: 0.3 });
  const [currentColor, setCurrentColor] = useState(() => posToHex(0.5, 0.3));
  const [hasDragged, setHasDragged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DOT_SIZE = 22;

  const updatePos = useCallback((clientX: number, clientY: number) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    posRef.current = { x, y };
    setPos({ x, y });
    const hex = posToHex(x, y);
    setCurrentColor(hex);
    setHasDragged(true);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    // Capture on the area element so pointerup fires on it too
    areaRef.current?.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setShowTooltip(false);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    updatePos(e.clientX, e.clientY);
  }, [updatePos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePos(e.clientX, e.clientY);
  }, [isDragging, updatePos]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    // Compute fixed screen position for tooltip (above dot, centered)
    // Read from ref to avoid stale closure from pointer capture
    const p = posRef.current;
    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      const dotCenterX = rect.left + p.x * rect.width;
      const dotTopY = rect.top + p.y * rect.height - DOT_SIZE / 2;
      setTooltipPos({ x: dotCenterX, y: dotTopY - 8 });
    }
    setShowTooltip(true);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => setShowTooltip(false), 2000);
  }, []);

  useEffect(() => {
    return () => { if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current); };
  }, []);

  useEffect(() => {
    if (hasDragged) {
      onSelect(currentColor);
    }
  }, [currentColor, hasDragged, onSelect]);

  return (
    <div className="px-4 pb-2">
      {/* Spectrum area — full width, pure hue spectrum */}
      <div
        ref={areaRef}
        className="relative rounded-xl overflow-hidden cursor-crosshair select-none touch-none"
        style={{ height: 160 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Hue gradient (horizontal) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, hsl(0 100% 50%), hsl(30 100% 50%), hsl(60 100% 50%), hsl(90 100% 50%), hsl(120 100% 50%), hsl(150 100% 50%), hsl(180 100% 50%), hsl(210 100% 50%), hsl(240 100% 50%), hsl(270 100% 50%), hsl(300 100% 50%), hsl(330 100% 50%), hsl(360 100% 50%))",
          }}
        />
        {/* Lightness overlay — dark at bottom for richer tones */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        {/* Picker dot */}
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            left: `calc(${pos.x * 100}% - ${DOT_SIZE / 2}px)`,
            top: `calc(${pos.y * 100}% - ${DOT_SIZE / 2}px)`,
            borderRadius: "50%",
            background: currentColor,
            border: "3px solid white",
            boxShadow: isDragging
              ? "0 0 0 2px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.2)"
              : "0 0 0 1px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.15)",
            transition: isDragging ? "none" : "box-shadow 0.15s ease",
          }}
        />
      </div>

      {/* Tooltip — fixed position to escape all overflow contexts */}
      <AnimatePresence>
        {showTooltip && hasDragged && tooltipPos && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900 shadow-lg whitespace-nowrap pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: 14,
                height: 14,
                background: currentColor,
                border: "1.5px solid rgba(255,255,255,0.4)",
              }}
            />
            <span className="text-xs text-white font-medium" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {currentColor.toUpperCase()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── People Picker ──────────────────────────────────────────

const MOCK_BOARD_PEOPLE = [
  { id: "1", name: "Kyra Osei", role: "Product Lead" },
  { id: "2", name: "Marcus Chen", role: "Engineering Manager" },
  { id: "3", name: "Priya Sharma", role: "UX Designer" },
  { id: "4", name: "Alex Rivera", role: "Data Scientist" },
  { id: "5", name: "Sofia Andersson", role: "Product Designer" },
  { id: "6", name: "James Park", role: "Frontend Engineer" },
  { id: "7", name: "Nina Kowalski", role: "Research Lead" },
  { id: "8", name: "Tomás Herrera", role: "Strategy Director" },
] as const;

function PeoplePicker({ onSelect }: { onSelect: (names: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const names = MOCK_BOARD_PEOPLE.filter(p => next.has(p.id)).map(p => p.name);
      onSelect(names);
      return next;
    });
  };

  const avatarUrl = (name: string) =>
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {MOCK_BOARD_PEOPLE.map((person, i) => {
          const isChecked = selected.has(person.id);
          return (
            <button
              key={person.id}
              onClick={() => toggle(person.id)}
              className="flex flex-col items-center gap-1.5 animate-slideInFromLeft"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 transition-all duration-200"
                  style={{
                    boxShadow: isChecked ? "0 0 0 2.5px white, 0 0 0 4.5px #4338ca" : "none",
                    transform: isChecked ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <img
                    src={avatarUrl(person.name)}
                    alt={person.name}
                    className="w-full h-full"
                    loading="eager"
                  />
                </div>
                {/* Check badge */}
                {isChecked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Name only */}
              <div className={`text-xs font-medium truncate text-center w-full transition-colors duration-200 ${isChecked ? "text-gray-900" : "text-gray-500"}`}>
                {person.name.split(" ")[0]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FloatingQuestionCard({
  question,
  options,
  onSelect,
  onSkip,
  onAskBoard,
  displayType = "options" as "options" | "scale" | "time" | "counter" | "multiChoice" | "matrix" | "stylePicker" | "colorPicker" | "peoplePicker",
  leftLabel,
  rightLabel,
  topLabel,
  bottomLabel,
  scaleLeftColor,
  scaleRightColor,
  maxMinutes,
  maxCount,
  counterUnit,
}: {
  question: string;
  options: string[];
  onSelect: (answer: string) => void;
  onSkip: () => void;
  onAskBoard?: () => void;
  displayType?: "options" | "scale" | "time" | "counter" | "multiChoice" | "matrix" | "stylePicker" | "colorPicker" | "peoplePicker";
  leftLabel?: string;
  rightLabel?: string;
  topLabel?: string;
  bottomLabel?: string;
  scaleLeftColor?: string;
  scaleRightColor?: string;
  maxMinutes?: number;
  maxCount?: number;
  counterUnit?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [dialMinutes, setDialMinutes] = useState(0);
  const [counterValue, setCounterValue] = useState(1);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const matrixPosRef = useRef({ x: 0.5, y: 0.5 });
  const [matrixHasDragged, setMatrixHasDragged] = useState(false);
  const [stylePickerSelection, setStylePickerSelection] = useState<string | null>(null);
  const [colorPickerSelection, setColorPickerSelection] = useState<string | null>(null);
  const [peoplePickerSelection, setPeoplePickerSelection] = useState<string[]>([]);

  // Reset state when question changes (e.g. advancing to next question)
  useEffect(() => {
    setSelectedIndex(0);
    setCustomInput("");
    setShowCustomInput(false);
    setStylePickerSelection(null);
    setColorPickerSelection(null);
    setPeoplePickerSelection([]);
  }, [question]);

  // Filter out "something else" from options since we have built-in custom input
  const filteredOptions = options.filter(opt => !opt.toLowerCase().includes('something else'));

  const isScale = displayType === "scale";
  const isTime = displayType === "time";
  const isCounter = displayType === "counter";
  const isMultiChoice = displayType === "multiChoice";
  const isMatrix = displayType === "matrix";
  const isStylePicker = displayType === "stylePicker";
  const isColorPicker = displayType === "colorPicker";
  const isPeoplePicker = displayType === "peoplePicker";

  // Keyboard navigation (only for options mode)
  useEffect(() => {
    if (isScale || isTime || isCounter || isMultiChoice || isMatrix || isStylePicker || isColorPicker || isPeoplePicker) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (showCustomInput) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(filteredOptions.length, prev + 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex === filteredOptions.length) {
          setShowCustomInput(true);
        } else {
          onSelect(filteredOptions[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScale, isTime, isCounter, isMatrix, isStylePicker, isColorPicker, isPeoplePicker, selectedIndex, filteredOptions, onSelect, onSkip, showCustomInput]);

  // Escape to skip in scale/time/counter mode
  useEffect(() => {
    if (!isScale && !isTime && !isCounter && !isMultiChoice && !isMatrix && !isStylePicker && !isColorPicker && !isPeoplePicker) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScale, isTime, isCounter, isMultiChoice, isMatrix, isStylePicker, isColorPicker, isPeoplePicker, onSkip]);

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onSelect(customInput.trim());
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white text-gray-900 shadow-elevated overflow-hidden border border-gray-200" style={{ borderRadius: 24 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-base font-medium flex-1 pr-4">{question}</p>
          <MdsIconButton aria-label="Skip question" variant="ghost" size="medium" onPress={onSkip}>
            <IconCross />
          </MdsIconButton>
        </div>

        {/* Custom input mode — shared across all display modes */}
        {showCustomInput ? (
          <div className="px-4 pb-4">
            <input
              autoFocus
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customInput.trim()) {
                  e.preventDefault();
                  handleCustomSubmit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setShowCustomInput(false);
                  setCustomInput("");
                }
              }}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 bg-gray-100 text-gray-900 placeholder-gray-400 outline-none border border-gray-200 focus:border-gray-300"
              style={{ borderRadius: 24 }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="ghost" size="medium" onPress={() => { setShowCustomInput(false); setCustomInput(""); }}>
                <Button.Label>Back</Button.Label>
              </Button>
              <Button variant="primary" size="medium" disabled={!customInput.trim()} onPress={handleCustomSubmit}>
                <Button.Label>Submit</Button.Label>
              </Button>
            </div>
          </div>
        ) : isCounter ? (
          <>
            <Counter
              maxCount={maxCount || 50}
              onChange={setCounterValue}
            />
            {/* Footer row with Confirm */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  onPress={() => {
                    const unit = counterUnit || "";
                    const label = unit ? (counterValue === 1 ? unit : `${unit}s`) : "";
                    onSelect(`${counterValue}${label ? ` ${label}` : ""}`);
                  }}
                >
                  <Button.Label>Confirm</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : isTime ? (
          <>
            <TimeDial
              maxMinutes={maxMinutes || 60}
              onChange={setDialMinutes}
            />
            {/* Footer row with Confirm */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
                <Button variant="primary" size="medium" onPress={() => onSelect(formatTime(dialMinutes))}>
                  <Button.Label>Confirm</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : isScale ? (
          <>
            <ScaleBar
              leftLabel={leftLabel || "Low"}
              rightLabel={rightLabel || "High"}
              leftColor={scaleLeftColor}
              rightColor={scaleRightColor}
              onSelect={onSelect}
            />
            {/* Footer row */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                {onAskBoard && (
                  <Button variant="ghost" size="medium" onPress={onAskBoard}>
                    <Button.IconSlot><IconBoard /></Button.IconSlot>
                    <Button.Label>Ask the Board</Button.Label>
                  </Button>
                )}
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : isMatrix ? (
          <>
            <MatrixGrid
              topLabel={topLabel || "Top"}
              bottomLabel={bottomLabel || "Bottom"}
              leftLabel={leftLabel || "Left"}
              rightLabel={rightLabel || "Right"}
              posRef={matrixPosRef}
              onDragStateChange={(d) => setMatrixHasDragged(prev => prev || d)}
            />
            {/* Footer row with Confirm */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  disabled={!matrixHasDragged}
                  onPress={() => {
                    const { x, y } = matrixPosRef.current;
                    onSelect(formatMatrixAnswer(x, y, leftLabel || "Left", rightLabel || "Right", topLabel || "Top", bottomLabel || "Bottom"));
                  }}
                >
                  <Button.Label>Confirm</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : isStylePicker ? (
          /* Style picker mode — 2x2 grid of AI-generated style thumbnails */
          <>
            <StylePicker
              options={filteredOptions}
              onSelect={(desc) => setStylePickerSelection(desc)}
            />
            {/* Footer row with Confirm */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  disabled={!stylePickerSelection}
                  onPress={() => { if (stylePickerSelection) onSelect(stylePickerSelection); }}
                >
                  <Button.Label>Confirm</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : isColorPicker ? (
          /* Color picker mode — 2D hue/saturation spectrum */
          <>
            <ColorSpectrum
              onSelect={(hex) => setColorPickerSelection(hex)}
            />
            {/* Footer row with Confirm */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  disabled={!colorPickerSelection}
                  onPress={() => { if (colorPickerSelection) onSelect(colorPickerSelection); }}
                >
                  <Button.Label>Confirm</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : isPeoplePicker ? (
          /* People picker mode — multi-select list of board participants */
          <>
            <PeoplePicker onSelect={(names) => setPeoplePickerSelection(names)} />
            {/* Footer row */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  disabled={peoplePickerSelection.length === 0}
                  onPress={() => { if (peoplePickerSelection.length > 0) onSelect(peoplePickerSelection.join(", ")); }}
                >
                  <Button.Label>Confirm{peoplePickerSelection.length > 0 ? ` (${peoplePickerSelection.length})` : ""}</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : isMultiChoice ? (
          /* Multi-choice mode — toggleable checkboxes with Confirm */
          <>
            <div className="px-3 py-2 space-y-1">
              {filteredOptions.map((option, i) => {
                const isChecked = multiSelected.has(option);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setMultiSelected(prev => {
                        const next = new Set(prev);
                        if (next.has(option)) next.delete(option);
                        else next.add(option);
                        return next;
                      });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors animate-slideInFromLeft ${
                      isChecked ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Checkbox */}
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked
                          ? "bg-gray-900 text-white"
                          : "border-2 border-gray-300"
                      }`}
                    >
                      {isChecked && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-left flex-1">{option}</span>
                  </button>
                );
              })}
            </div>
            {/* Footer row */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  disabled={multiSelected.size === 0}
                  onPress={() => { if (multiSelected.size > 0) onSelect(Array.from(multiSelected).join(", ")); }}
                >
                  <Button.Label>Confirm{multiSelected.size > 0 ? ` (${multiSelected.size})` : ""}</Button.Label>
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Options mode */
          <>
            <div className="px-3 py-2 space-y-1">
              {filteredOptions.map((option, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(option)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors animate-slideInFromLeft ${
                    selectedIndex === i ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-sm font-medium text-gray-600">
                    {i + 1}
                  </span>
                  <span className="text-left flex-1">{option}</span>
                  {selectedIndex === i && (
                    <IconArrowRight css={{ width: 18, height: 18, color: 'var(--color-gray-400)' }} />
                  )}
                </button>
              ))}

              {/* Something else + Ask the Board + Skip row */}
              <div className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                selectedIndex === filteredOptions.length ? "bg-gray-100" : ""
              }`}>
                <button
                  onClick={() => setShowCustomInput(true)}
                  onMouseEnter={() => setSelectedIndex(filteredOptions.length)}
                  className="flex items-center gap-3 flex-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                    <IconSquarePencil css={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-gray-400">Something else</span>
                </button>
                {onAskBoard && (
                  <Button variant="ghost" size="medium" onPress={onAskBoard}>
                    <Button.IconSlot><IconBoard /></Button.IconSlot>
                    <Button.Label>Ask the Board</Button.Label>
                  </Button>
                )}
                <Button variant="ghost" size="medium" onPress={onSkip}>
                  <Button.Label>Skip</Button.Label>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keyboard hints — below the card */}
      <div className="py-2 text-xs text-gray-400 text-center">
        {isCounter ? "+/− to adjust · Click Confirm · Esc to skip" : isTime ? "Drag to set time · Click Confirm · Esc to skip" : isScale ? "Click the bar to answer · Esc to skip" : isMatrix ? "Drag the dot · Click Confirm · Esc to skip" : isStylePicker ? "Click a style · Confirm to select · Esc to skip" : isColorPicker ? "Drag to pick a color · Confirm to select · Esc to skip" : isPeoplePicker ? "Click to select people · Confirm to submit · Esc to skip" : isMultiChoice ? "Click to toggle · Confirm to submit · Esc to skip" : "↑↓ to navigate · Enter to select · Esc to skip"}
      </div>
    </div>
  );
}

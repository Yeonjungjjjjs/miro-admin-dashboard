// Dimension tokens for the toolbar layout
export const TOOLBAR_HEIGHT = 60;
export const CELL_W = 50;
export const CELL_H = 42;
export const ICON_SIZE = 26;
export const CONTAINER_RADIUS = 24;
export const CONTAINER_PADDING = 8;
export const CHAT_INPUT_WIDTH = 246;
export const CHAT_INPUT_WIDTH_FOCUSED = 420 - CONTAINER_PADDING * 2; // 404 (420px inclusive of container padding)
export const DISCONNECTED_GAP = 16;
export const DIVIDER_SLOT_WIDTH = 18;
export const DIVIDER_HEIGHT = 44;

// Sub-tool menu dimensions
export const SUB_MENU_CELL_H = 56;
export const SUB_MENU_HEIGHT = 68;
export const SUB_MENU_ICON_SIZE = ICON_SIZE;

// Toolbar-specific springs (for the connected/disconnected morph animation)
export const SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 12,
  mass: 0.8,
};

export const SPRING_DAMPED = {
  type: "spring" as const,
  stiffness: 300,
  damping: 26,
  mass: 1.2,
};

// Shared toolbar shadow
export const TOOLBAR_SHADOW = "0 6px 16px rgba(34,36,40,0.12), 0 0px 8px rgba(34,36,40,0.06)";

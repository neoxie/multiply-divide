// Shared color constants for vertical calculation display
export const COLORS = {
  green: { bg: "#A5D6A7", text: "#1B5E20" },
  blue: { bg: "#90CAF9", text: "#0D47A1" },
  orange: { bg: "#FFCC80", text: "#E65100" },
  red: { bg: "#EF9A9A", text: "#B71C1C" },
  symbol: "#C62828",
  line: "#555555",
} as const;

// Shared layout constants
export const LAYOUT = {
  digitCellSize: 36,
  cellBorderRadius: 6,
  cellGap: 2,
  multiplication: {
    symbolColWidth: 24,
    rowGap: 4,
    rowHeight: 40,
  },
  division: {
    symbolColWidth: 20,
    bracketPaddingLeft: 8,
    bracketLineHeight: 6,
    lineCellHeight: 8,
  },
} as const;

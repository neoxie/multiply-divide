import { LAYOUT } from "./constants";

interface DigitCellProps {
  char: string | number;
  bgColor?: string;
  textColor?: string;
  size?: number;
  fontSize?: number;
}

export default function DigitCell({
  char,
  bgColor,
  textColor,
  size = LAYOUT.digitCellSize,
  fontSize = 20,
}: DigitCellProps) {
  if (char === " " || char === "") {
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        fontFamily: "monospace",
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(textColor ? { color: textColor } : {}),
        borderRadius: LAYOUT.cellBorderRadius,
      }}
    >
      {char}
    </div>
  );
}

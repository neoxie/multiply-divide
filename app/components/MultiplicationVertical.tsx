'use client';

const GREEN_BG = "#A5D6A7";
const GREEN_TEXT = "#1B5E20";
const BLUE_BG = "#90CAF9";
const BLUE_TEXT = "#0D47A1";
const ORANGE_BG = "#FFCC80";
const ORANGE_TEXT = "#E65100";
const RED_BG = "#EF9A9A";
const RED_TEXT = "#B71C1C";
const SYMBOL_COLOR = "#C62828";
const LINE_COLOR = "#555555";

const SYMBOL_COL_WIDTH = 24;
const DIGIT_COL_WIDTH = 36;
const ROW_GAP = 4;

function computePartialProducts(
  a: number,
  b: number
): { value: number; placeOffset: number }[] {
  const bDigits = String(b).split("");
  const products: { value: number; placeOffset: number }[] = [];
  for (let i = bDigits.length - 1; i >= 0; i--) {
    const digitVal = parseInt(bDigits[i], 10);
    const placeOffset = bDigits.length - 1 - i;
    products.push({ value: a * digitVal, placeOffset });
  }
  return products;
}

interface CellProps {
  char: string;
  bgColor?: string;
  textColor?: string;
  isLarger?: boolean;
}

function DigitCell({ char, bgColor, textColor, isLarger }: CellProps) {
  if (char === " " || char === "") {
    return <div style={{ width: DIGIT_COL_WIDTH, height: 40 }} />;
  }

  if (!bgColor || !textColor) {
    return (
      <div
        style={{
          width: DIGIT_COL_WIDTH,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isLarger ? 20 : 18,
          fontWeight: 700,
          fontFamily: "monospace",
          color: textColor || SYMBOL_COLOR,
        }}
      >
        {char}
      </div>
    );
  }

  return (
    <div
      style={{
        width: DIGIT_COL_WIDTH,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isLarger ? 20 : 18,
        fontWeight: 700,
        fontFamily: "monospace",
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: 6,
      }}
    >
      {char}
    </div>
  );
}

function SymbolCell({ char, color, width }: { char: string; color?: string; width?: number }) {
  return (
    <div
      style={{
        width: width || SYMBOL_COL_WIDTH,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 700,
        fontFamily: "monospace",
        color: color || SYMBOL_COLOR,
      }}
    >
      {char}
    </div>
  );
}

function LineRow({ numCols }: { numCols: number }) {
  const totalWidth = SYMBOL_COL_WIDTH + numCols * DIGIT_COL_WIDTH;
  return (
    <div
      style={{
        width: totalWidth,
        height: 2,
        backgroundColor: LINE_COLOR,
        margin: "2px 0",
      }}
    />
  );
}

export default function MultiplicationVertical({
  a,
  b,
}: {
  a: number;
  b: number;
}) {
  const product = a * b;
  const multiplicandStr = String(a);
  const multiplierStr = String(b);
  const productStr = String(product);

  const partials = computePartialProducts(a, b);

  // Calculate display strings for partial products (with trailing zeros)
  const partialDisplayStrings = partials.map((p) => {
    const valStr = String(p.value);
    return valStr + "0".repeat(p.placeOffset);
  });

  // Determine number of digit columns:
  // max of (multiplicand digits, multiplier digits, each partial product digits, product digits)
  // Then +1 for symbol column is handled separately
  const maxDigitCols = Math.max(
    multiplicandStr.length,
    multiplierStr.length,
    ...partialDisplayStrings.map((s) => s.length),
    productStr.length
  );

  const numDigitCols = maxDigitCols;
  const totalGridCols = 1 + numDigitCols; // symbol column + digit columns

  // Helper: right-align digits into numDigitCols columns
  // Returns array of length numDigitCols, with spaces for empty positions
  function rightAlignDigits(str: string): string[] {
    const padded = str.padStart(numDigitCols, " ");
    return padded.split("");
  }

  // Build rows
  type Row =
    | { type: "digits"; symbol: string; digits: string[]; bgColor: string; textColor: string; isLarger?: boolean; symbolColor?: string }
    | { type: "line" };

  const rows: Row[] = [];

  // Row 1: multiplicand (green)
  rows.push({
    type: "digits",
    symbol: " ",
    digits: rightAlignDigits(multiplicandStr),
    bgColor: GREEN_BG,
    textColor: GREEN_TEXT,
  });

  // Row 2: multiplier (blue) with × symbol
  const multiplierDigits = rightAlignDigits(multiplierStr);
  // Find the index of the first non-space digit in the multiplier
  const firstMultiplierDigitIdx = multiplierDigits.findIndex(
    (d) => d !== " "
  );
  // The × goes right before the first digit of the multiplier
  // We need a special row where × replaces the space just before the first digit
  rows.push({
    type: "digits",
    symbol: "×",
    digits: multiplierDigits,
    bgColor: BLUE_BG,
    textColor: BLUE_TEXT,
    symbolColor: SYMBOL_COLOR,
  });

  // Line
  rows.push({ type: "line" });

  // Partial product rows (orange)
  partialDisplayStrings.forEach((partialStr, idx) => {
    const partialDigits = rightAlignDigits(partialStr);
    const firstDigitIdx = partialDigits.findIndex((d) => d !== " ");
    rows.push({
      type: "digits",
      symbol: idx === 0 ? " " : "+",
      digits: partialDigits,
      bgColor: ORANGE_BG,
      textColor: ORANGE_TEXT,
      symbolColor: idx === 0 ? undefined : SYMBOL_COLOR,
    });
  });

  // Line
  rows.push({ type: "line" });

  // Row: product (red, slightly larger)
  rows.push({
    type: "digits",
    symbol: " ",
    digits: rightAlignDigits(productStr),
    bgColor: RED_BG,
    textColor: RED_TEXT,
    isLarger: true,
  });

  // Render
  // For the multiplier row, we need special handling of × placement:
  // The × symbol should be in the column immediately before the first digit
  // For partial product rows with +, the + should be immediately before the first digit

  function renderDigitRow(
    row: Row & { type: "digits" }
  ): React.ReactNode {
    if (row.type !== "digits") return null;

    const { symbol, digits, bgColor, textColor, isLarger, symbolColor } = row;

    // Find where the first actual digit is
    const firstDigitIdx = digits.findIndex((d) => d !== " ");

    // Build cells for the digit columns
    // We need to figure out where to place the symbol
    // The symbol should go immediately before the first digit
    // If the first digit is at index 0, the symbol goes in the symbol column
    // If the first digit is at index > 0, the symbol replaces the space at firstDigitIdx - 1

    const cells: React.ReactNode[] = [];

    // Symbol column
    // If the first digit is at index 0, the symbol goes in the dedicated symbol column
    // Otherwise, if there's a symbol (× or +), it replaces the space before the first digit
    if (firstDigitIdx === 0) {
      // Symbol goes in the dedicated symbol column
      cells.push(
        <div key="sym" style={{ display: "flex" }}>
          <SymbolCell char={symbol} color={symbolColor} />
        </div>
      );
    } else if (symbol === "×" || symbol === "+") {
      // Symbol replaces the space immediately before the first digit
      // The dedicated symbol column is empty
      cells.push(
        <div key="sym" style={{ display: "flex" }}>
          <SymbolCell char=" " />
        </div>
      );
    } else {
      cells.push(
        <div key="sym" style={{ display: "flex" }}>
          <SymbolCell char=" " />
        </div>
      );
    }

    // Digit columns
    digits.forEach((digit, colIdx) => {
      // Check if this position should show the symbol instead
      if (
        (symbol === "×" || symbol === "+") &&
        colIdx === firstDigitIdx - 1 &&
        firstDigitIdx > 0
      ) {
        cells.push(
          <div key={`d${colIdx}`} style={{ display: "flex" }}>
            <SymbolCell char={symbol} color={symbolColor} width={DIGIT_COL_WIDTH} />
          </div>
        );
      } else if (digit !== " ") {
        cells.push(
          <div key={`d${colIdx}`} style={{ display: "flex" }}>
            <DigitCell
              char={digit}
              bgColor={bgColor}
              textColor={textColor}
              isLarger={isLarger}
            />
          </div>
        );
      } else {
        cells.push(
          <div key={`d${colIdx}`} style={{ display: "flex" }}>
            <DigitCell char=" " />
          </div>
        );
      }
    });

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
        }}
      >
        {cells}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: ROW_GAP,
        alignItems: "flex-start",
        padding: 16,
      }}
    >
      {rows.map((row, idx) => {
        if (row.type === "line") {
          return <LineRow key={`line-${idx}`} numCols={numDigitCols} />;
        }
        return (
          <div key={`row-${idx}`}>
            {renderDigitRow(row as Row & { type: "digits" })}
          </div>
        );
      })}
    </div>
  );
}

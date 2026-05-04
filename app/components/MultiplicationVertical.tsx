'use client';

import { COLORS, LAYOUT } from "./constants";
import DigitCell from "./DigitCell";

const { symbolColWidth, rowGap, rowHeight } = LAYOUT.multiplication;

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

function SymbolCell({ char, color, width }: { char: string; color?: string; width?: number }) {
  return (
    <div
      style={{
        width: width || symbolColWidth,
        height: rowHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 700,
        fontFamily: "monospace",
        color: color || COLORS.symbol,
      }}
    >
      {char}
    </div>
  );
}

function LineRow({ numCols }: { numCols: number }) {
  const totalWidth = symbolColWidth + numCols * LAYOUT.digitCellSize;
  return (
    <div
      style={{
        width: totalWidth,
        height: 2,
        backgroundColor: COLORS.line,
        margin: "2px 0",
      }}
    />
  );
}

type Row =
  | { type: "digits"; symbol: string; digits: string[]; bgColor: string; textColor: string; isLarger?: boolean; symbolColor?: string }
  | { type: "line" };

// The × and + symbols replace the space immediately before the first digit,
// rather than sitting in the dedicated symbol column — standard vertical format.
function renderDigitRow(
  row: Row & { type: "digits" },
  rowKey: string
): React.ReactNode {
  const { symbol, digits, bgColor, textColor, isLarger, symbolColor } = row;
  const firstDigitIdx = digits.findIndex((d) => d !== " ");
  const hasInlineSymbol = firstDigitIdx > 0 && (symbol === "×" || symbol === "+");

  const cells: React.ReactNode[] = [];

  cells.push(
    <SymbolCell key="sym" char=" " color={symbolColor} />
  );

  digits.forEach((digit, colIdx) => {
    if (hasInlineSymbol && colIdx === firstDigitIdx - 1) {
      cells.push(
        <SymbolCell
          key={`d${colIdx}`}
          char={symbol}
          color={symbolColor}
          width={LAYOUT.digitCellSize}
        />
      );
    } else if (digit !== " ") {
      cells.push(
        <DigitCell
          key={`d${colIdx}`}
          char={digit}
          bgColor={bgColor}
          textColor={textColor}
          size={LAYOUT.digitCellSize}
          fontSize={isLarger ? 20 : 18}
        />
      );
    } else {
      cells.push(
        <DigitCell key={`d${colIdx}`} char=" " />
      );
    }
  });

  return (
    <div
      key={rowKey}
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

  const partialDisplayStrings = partials.map((p) => {
    const valStr = String(p.value);
    return valStr + "0".repeat(p.placeOffset);
  });

  const numDigitCols = Math.max(
    multiplicandStr.length,
    multiplierStr.length,
    ...partialDisplayStrings.map((s) => s.length),
    productStr.length
  );

  const lastPartialStr = partialDisplayStrings[partialDisplayStrings.length - 1];
  const needsExtraCol = partialDisplayStrings.length >= 2 && lastPartialStr.length === numDigitCols;
  const effectiveNumDigitCols = needsExtraCol ? numDigitCols + 1 : numDigitCols;

  function rightAlignDigits(str: string): string[] {
    return str.padStart(effectiveNumDigitCols, " ").split("");
  }

  const rows: Row[] = [];

  rows.push({
    type: "digits",
    symbol: " ",
    digits: rightAlignDigits(multiplicandStr),
    bgColor: COLORS.green.bg,
    textColor: COLORS.green.text,
  });

  rows.push({
    type: "digits",
    symbol: "×",
    digits: rightAlignDigits(multiplierStr),
    bgColor: COLORS.blue.bg,
    textColor: COLORS.blue.text,
    symbolColor: COLORS.symbol,
  });

  rows.push({ type: "line" });

  partialDisplayStrings.forEach((partialStr, idx) => {
    rows.push({
      type: "digits",
      symbol: idx === partialDisplayStrings.length - 1 ? "+" : " ",
      digits: rightAlignDigits(partialStr),
      bgColor: COLORS.orange.bg,
      textColor: COLORS.orange.text,
      symbolColor: idx === partialDisplayStrings.length - 1 ? COLORS.symbol : undefined,
    });
  });

  rows.push({ type: "line" });

  rows.push({
    type: "digits",
    symbol: " ",
    digits: rightAlignDigits(productStr),
    bgColor: COLORS.red.bg,
    textColor: COLORS.red.text,
    isLarger: true,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: rowGap,
        alignItems: "flex-start",
        padding: 16,
      }}
    >
      {rows.map((row, idx) => {
        if (row.type === "line") {
          return <LineRow key={`line-${idx}`} numCols={effectiveNumDigitCols} />;
        }
        return renderDigitRow(row as Row & { type: "digits" }, `row-${idx}`);
      })}
    </div>
  );
}

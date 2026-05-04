"use client";

import { COLORS, LAYOUT } from "./constants";
import DigitCell from "./DigitCell";

const { symbolColWidth, bracketPaddingLeft, bracketLineHeight, lineCellHeight } = LAYOUT.division;
const { digitCellSize, cellGap } = LAYOUT;

interface DivisionStep {
  quotientDigit: number;
  portion: number;
  subtractValue: number;
  remainder: number;
  broughtDownDigit?: number;
  portionEndIndex: number;
}

function computeDivisionSteps(
  dividendStr: string,
  divisor: number,
  quotientStr: string
): DivisionStep[] {
  const quotientDigits = quotientStr.split("");
  const dividendDigits = dividendStr.split("");
  const steps: DivisionStep[] = [];

  let currentPortion = 0;
  let digitIndex = 0;

  for (let i = 0; i < quotientDigits.length; i++) {
    const qDigit = parseInt(quotientDigits[i], 10);

    while (currentPortion < divisor && digitIndex < dividendDigits.length) {
      currentPortion =
        currentPortion * 10 + parseInt(dividendDigits[digitIndex], 10);
      digitIndex++;
    }

    const subtractValue = qDigit * divisor;
    const remainder = currentPortion - subtractValue;
    const broughtDown =
      i < quotientDigits.length - 1 && digitIndex < dividendDigits.length
        ? parseInt(dividendDigits[digitIndex], 10)
        : undefined;

    steps.push({
      quotientDigit: qDigit,
      portion: currentPortion,
      subtractValue,
      remainder,
      broughtDownDigit: broughtDown,
      portionEndIndex: digitIndex,
    });
    currentPortion = remainder;
  }

  return steps;
}

function computeLineWidth(startCol: number, endCol: number): number {
  return (
    (startCol === 1 ? symbolColWidth : digitCellSize) +
    (endCol - startCol) * (digitCellSize + cellGap)
  );
}

type GridItem = {
  col: number;
  row: number;
  span?: number;
  content: React.ReactNode;
  isLine?: boolean;
  isBracketLine?: boolean;
};

export default function DivisionVertical({
  dividend,
  divisor,
  quotient,
}: {
  dividend: number;
  divisor: number;
  quotient: number;
}) {
  const dividendStr = String(dividend);
  const divisorStr = String(divisor);
  const quotientStr = String(quotient);
  const dividendDigits = dividendStr.split("");
  const divisorDigits = divisorStr.split("");
  const quotientDigits = quotientStr.split("");

  const steps = computeDivisionSteps(dividendStr, divisor, quotientStr);

  const totalDigitCols = dividendDigits.length;

  const gridTemplateCols = [
    `${symbolColWidth}px`,
    ...Array(totalDigitCols).fill(`${digitCellSize}px`),
  ].join(" ");

  const items: GridItem[] = [];

  // Row 1: Quotient digits, right-aligned with dividend
  const quotientStartCol = 2 + totalDigitCols - quotientDigits.length;
  quotientDigits.forEach((d, i) => {
    items.push({
      col: quotientStartCol + i,
      row: 1,
      content: (
        <DigitCell char={d} bgColor={COLORS.red.bg} textColor={COLORS.red.text} />
      ),
    });
  });

  // Row 2: Bracket line spanning all digit columns
  const bracketLineSpan = 1 + totalDigitCols;
  items.push({
    col: 1,
    row: 2,
    span: bracketLineSpan,
    isLine: true,
    isBracketLine: true,
    content: (
      <div
        style={{
          width: computeLineWidth(1, 1 + totalDigitCols),
          height: 2,
          backgroundColor: COLORS.line,
        }}
      />
    ),
  });

  // Row 3: Dividend digits
  dividendDigits.forEach((d, i) => {
    items.push({
      col: 2 + i,
      row: 3,
      content: (
        <DigitCell char={d} bgColor={COLORS.green.bg} textColor={COLORS.green.text} />
      ),
    });
  });

  let currentGridRow = 4;

  for (let si = 0; si < steps.length; si++) {
    const step = steps[si];
    const subtractStr = String(step.subtractValue);
    const portionStr = String(step.portion);

    const portionRightCol = 2 + step.portionEndIndex - 1;
    const portionStartCol = 2 + step.portionEndIndex - portionStr.length;
    const subtractStartCol = portionRightCol - subtractStr.length + 1;
    const minusCol = portionStartCol - 1;

    // Subtract row
    items.push({
      col: minusCol,
      row: currentGridRow,
      content: (
        <span
          style={{
            color: COLORS.symbol,
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          −
        </span>
      ),
    });

    subtractStr.split("").forEach((d, i) => {
      items.push({
        col: subtractStartCol + i,
        row: currentGridRow,
        content: (
          <DigitCell
            char={d}
            bgColor={COLORS.orange.bg}
            textColor={COLORS.orange.text}
          />
        ),
      });
    });

    currentGridRow++;

    // Line row
    const lineEndCol = portionRightCol;
    const lineSpan = lineEndCol - minusCol + 1;

    items.push({
      col: minusCol,
      row: currentGridRow,
      span: lineSpan,
      isLine: true,
      content: (
        <div
          style={{
            width: computeLineWidth(minusCol, lineEndCol),
            height: 2,
            backgroundColor: COLORS.line,
          }}
        />
      ),
    });

    currentGridRow++;

    // Remainder + brought-down row
    if (si < steps.length - 1 && step.broughtDownDigit !== undefined) {
      const remainderStr = String(step.remainder);
      const broughtDownCol = 2 + step.portionEndIndex;
      const remainderStartCol = broughtDownCol - remainderStr.length;

      remainderStr.split("").forEach((d, i) => {
        items.push({
          col: remainderStartCol + i,
          row: currentGridRow,
          content: (
            <DigitCell
              char={d}
              bgColor={COLORS.orange.bg}
              textColor={COLORS.orange.text}
            />
          ),
        });
      });

      items.push({
        col: broughtDownCol,
        row: currentGridRow,
        content: (
          <DigitCell
            char={step.broughtDownDigit!}
            bgColor={COLORS.green.bg}
            textColor={COLORS.green.text}
          />
        ),
      });
    } else {
      const remainderStr = String(step.remainder);
      const isLastStep = si === steps.length - 1;
      const remainderStartCol = 2 + totalDigitCols - remainderStr.length;

      remainderStr.split("").forEach((d, i) => {
        items.push({
          col: remainderStartCol + i,
          row: currentGridRow,
          content: (
            <DigitCell
              char={d}
              bgColor={isLastStep ? COLORS.green.bg : COLORS.orange.bg}
              textColor={isLastStep ? COLORS.green.text : COLORS.orange.text}
            />
          ),
        });
      });
    }

    currentGridRow++;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: cellGap,
          alignItems: "center",
          height: digitCellSize,
          paddingRight: 4,
          marginTop: digitCellSize + cellGap + bracketLineHeight + cellGap,
        }}
      >
        {divisorDigits.map((d, i) => (
          <DigitCell
            key={i}
            char={d}
            bgColor={COLORS.blue.bg}
            textColor={COLORS.blue.text}
          />
        ))}
      </div>

      <div
        style={{
          borderLeft: `2px solid ${COLORS.line}`,
          paddingLeft: bracketPaddingLeft,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridTemplateCols,
            columnGap: cellGap,
            rowGap: 2,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                gridColumn: item.span
                  ? `${item.col} / span ${item.span}`
                  : `${item.col}`,
                gridRow: `${item.row}`,
                display: "flex",
                alignItems: item.isBracketLine ? "flex-end" : "center",
                justifyContent: item.isLine ? "flex-start" : "center",
                height: item.isBracketLine ? bracketLineHeight : item.isLine ? lineCellHeight : digitCellSize,
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

interface DivisionStep {
  quotientDigit: number;
  portion: number;
  subtractValue: number;
  remainder: number;
  broughtDownDigit?: number;
  portionEndIndex: number; // exclusive index in dividend digits after portion was formed
}

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

const CELL_SIZE = 36;
const SYMBOL_COL_WIDTH = 20;
const CELL_GAP = 2;

function computeDivisionSteps(
  dividend: number,
  divisor: number,
  quotient: number
): DivisionStep[] {
  const quotientDigits = String(quotient).split("");
  const dividendDigits = String(dividend).split("");
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

function DigitCell({
  digit,
  bgColor,
  textColor,
}: {
  digit: string | number;
  bgColor: string;
  textColor: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 6,
        backgroundColor: bgColor,
        color: textColor,
        fontWeight: 700,
        fontSize: 20,
        lineHeight: 1,
      }}
    >
      {digit}
    </span>
  );
}

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

  const steps = computeDivisionSteps(dividend, divisor, quotient);

  const totalDigitCols = dividendDigits.length;

  // Grid columns: [sym 20px] [d1 36px] [d2 36px] ... [dN 36px]
  const gridTemplateCols = [
    `${SYMBOL_COL_WIDTH}px`,
    ...Array(totalDigitCols).fill(`${CELL_SIZE}px`),
  ].join(" ");

  // Bracket area padding
  const bracketPaddingLeft = 8;
  const BRACKET_LINE_HEIGHT = 6;

  // Grid column numbers: col 1 = symbol, col 2..(1+totalDigitCols) = digits
  // Dividend digit at index i maps to grid column 2+i
  // The rightmost column of the portion for step si is at column 2 + portionEndIndex - 1

  type GridItem = {
    col: number;
    row: number;
    span?: number;
    content: React.ReactNode;
    isLine?: boolean;
    isBracketLine?: boolean;
  };

  const items: GridItem[] = [];

  // Row 1: Quotient digits, right-aligned with dividend
  const quotientStartCol = 2 + totalDigitCols - quotientDigits.length;
  quotientDigits.forEach((d, i) => {
    items.push({
      col: quotientStartCol + i,
      row: 1,
      content: (
        <DigitCell digit={d} bgColor={RED_BG} textColor={RED_TEXT} />
      ),
    });
  });

  // Row 2: Bracket line spanning all digit columns
  const bracketLineSpan = 1 + totalDigitCols;
  let bracketLineWidth = 0;
  for (let c = 1; c <= 1 + totalDigitCols; c++) {
    bracketLineWidth += c === 1 ? SYMBOL_COL_WIDTH : CELL_SIZE;
    if (c > 1) bracketLineWidth += CELL_GAP;
  }
  items.push({
    col: 1,
    row: 2,
    span: bracketLineSpan,
    isLine: true,
    isBracketLine: true,
    content: (
      <div
        style={{
          width: bracketLineWidth,
          height: 2,
          backgroundColor: LINE_COLOR,
        }}
      />
    ),
  });

  // Row 3: Dividend digits in columns 2..(1+totalDigitCols)
  dividendDigits.forEach((d, i) => {
    items.push({
      col: 2 + i,
      row: 3,
      content: (
        <DigitCell digit={d} bgColor={GREEN_BG} textColor={GREEN_TEXT} />
      ),
    });
  });

  let currentGridRow = 4;

  for (let si = 0; si < steps.length; si++) {
    const step = steps[si];
    const subtractStr = String(step.subtractValue);

    // The portion for this step occupies dividend digit indices 0..portionEndIndex-1
    // (not exactly, but the right edge of the portion is at digit index portionEndIndex-1)
    // The subtract value is right-aligned with the portion's right edge.
    // portionRightCol = 2 + step.portionEndIndex - 1
    const portionRightCol = 2 + step.portionEndIndex - 1;

    // Subtract value right edge = portionRightCol
    // Subtract value left edge = portionRightCol - subtractStr.length + 1
    const subtractStartCol = portionRightCol - subtractStr.length + 1;

    // Minus sign goes one column before subtract value's left edge
    const minusCol = subtractStartCol - 1;

    // Subtract row: minus sign + subtract digits
    items.push({
      col: minusCol,
      row: currentGridRow,
      content: (
        <span
          style={{
            color: SYMBOL_COLOR,
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
            digit={d}
            bgColor={ORANGE_BG}
            textColor={ORANGE_TEXT}
          />
        ),
      });
    });

    currentGridRow++;

    // Line row: spans from minusCol to the rightmost column of the subtract value
    const lineEndCol = portionRightCol;
    const lineSpan = lineEndCol - minusCol + 1;

    // Compute pixel width of the line
    let lineWidth = 0;
    for (let c = minusCol; c <= lineEndCol; c++) {
      lineWidth += c === 1 ? SYMBOL_COL_WIDTH : CELL_SIZE;
      if (c > minusCol) lineWidth += CELL_GAP;
    }

    items.push({
      col: minusCol,
      row: currentGridRow,
      span: lineSpan,
      isLine: true,
      content: (
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: LINE_COLOR,
          }}
        />
      ),
    });

    currentGridRow++;

    // Remainder + brought-down row
    if (si < steps.length - 1 && step.broughtDownDigit !== undefined) {
      const remainderStr = String(step.remainder);
      const broughtDownDigit = step.broughtDownDigit;

      // The brought-down digit is at dividend index = step.portionEndIndex
      // Grid column for brought-down digit = 2 + step.portionEndIndex
      const broughtDownCol = 2 + step.portionEndIndex;

      // Remainder digits go right before the brought-down digit
      // Remainder right edge = broughtDownCol - 1
      // Remainder left edge = broughtDownCol - remainderStr.length
      const remainderStartCol = broughtDownCol - remainderStr.length;

      remainderStr.split("").forEach((d, i) => {
        items.push({
          col: remainderStartCol + i,
          row: currentGridRow,
          content: (
            <DigitCell
              digit={d}
              bgColor={ORANGE_BG}
              textColor={ORANGE_TEXT}
            />
          ),
        });
      });

      // Brought-down digit is GREEN
      items.push({
        col: broughtDownCol,
        row: currentGridRow,
        content: (
          <DigitCell
            digit={broughtDownDigit}
            bgColor={GREEN_BG}
            textColor={GREEN_TEXT}
          />
        ),
      });
    } else {
      // Final remainder
      const remainderStr = String(step.remainder);
      // Right-aligned with the dividend (rightmost digit column)
      const remainderStartCol =
        2 + totalDigitCols - remainderStr.length;

      remainderStr.split("").forEach((d, i) => {
        items.push({
          col: remainderStartCol + i,
          row: currentGridRow,
          content: (
            <DigitCell
              digit={d}
              bgColor={GREEN_BG}
              textColor={GREEN_TEXT}
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
      {/* Divisor - aligned with dividend row (row 3) */}
      <div
        style={{
          display: "flex",
          gap: CELL_GAP,
          alignItems: "center",
          height: CELL_SIZE,
          paddingRight: 4,
          marginTop: CELL_SIZE + CELL_GAP + BRACKET_LINE_HEIGHT + CELL_GAP,
        }}
      >
        {divisorDigits.map((d, i) => (
          <DigitCell
            key={i}
            digit={d}
            bgColor={BLUE_BG}
            textColor={BLUE_TEXT}
          />
        ))}
      </div>

      {/* Bracket area - borderLeft spans quotient + grid */}
      <div
        style={{
          borderLeft: `2px solid ${LINE_COLOR}`,
          paddingLeft: bracketPaddingLeft,
        }}
      >
        {/* Grid: row 0 = quotient, row 1 = bracket line, row 2 = dividend, ... */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridTemplateCols,
            columnGap: CELL_GAP,
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
                alignItems: item.isLine ? "flex-end" : "center",
                justifyContent: item.isLine ? "flex-start" : "center",
                height: item.isBracketLine ? BRACKET_LINE_HEIGHT : CELL_SIZE,
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

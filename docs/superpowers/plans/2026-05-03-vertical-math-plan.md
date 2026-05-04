# 乘除法竖式练习 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个单页面 Web 应用，帮助 6-8 岁小学生学习整数乘除法竖式计算。

**Architecture:** Next.js 16 单页应用。主页面管理出题/解答状态，两个独立组件分别渲染乘法和除法竖式。CSS Grid 实现精确数位对齐，CSS 变量管理颜色体系。所有交互逻辑在客户端完成（`'use client'`）。

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

---

## 文件结构

```
app/
├── layout.tsx                          # 根布局（已有，需修改标题和样式）
├── page.tsx                            # 主页面（已有，需重写为出题+竖式页面）
├── globals.css                         # 全局样式（已有，需添加 CSS 变量）
└── components/
    ├── MultiplicationVertical.tsx       # 乘法竖式组件
    └── DivisionVertical.tsx             # 除法竖式组件
```

---

### Task 1: CSS 变量和全局样式

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: 在 globals.css 中添加竖式颜色 CSS 变量**

在 `:root` 中添加颜色变量，保留已有的 `--background` 和 `--foreground`：

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;

  /* 竖式颜色体系 */
  --color-green-bg: #A5D6A7;
  --color-green-text: #1B5E20;
  --color-blue-bg: #90CAF9;
  --color-blue-text: #0D47A1;
  --color-orange-bg: #FFCC80;
  --color-orange-text: #E65100;
  --color-red-bg: #EF9A9A;
  --color-red-text: #B71C1C;
  --color-symbol: #C62828;
  --color-line: #555555;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: 更新 layout.tsx 标题和语言设置**

将标题改为"乘除法竖式练习"，语言改为中文：

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "乘除法竖式练习",
  description: "帮助小学生学习整数乘除法竖式计算",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: 验证构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add CSS variables for vertical math colors and update layout"
```

---

### Task 2: 题目生成和主页面状态管理

**Files:**
- Modify: `app/page.tsx`

这是核心任务 — 重写 page.tsx，包含题目生成逻辑和页面布局。

- [ ] **Step 1: 实现主页面**

将 `app/page.tsx` 完全重写为 `'use client'` 组件：

```tsx
'use client';

import { useState } from "react";
import MultiplicationVertical from "./components/MultiplicationVertical";
import DivisionVertical from "./components/DivisionVertical";

type Problem =
  | { type: "multiplication"; a: number; b: number }
  | { type: "division"; dividend: number; divisor: number; quotient: number };

function generateProblem(): Problem {
  if (Math.random() < 0.5) {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 100) + 1;
    return { type: "multiplication", a, b };
  } else {
    const divisor = Math.floor(Math.random() * 100) + 1;
    const quotient = Math.floor(Math.random() * 100) + 1;
    const dividend = divisor * quotient;
    return { type: "division", dividend, divisor, quotient };
  }
}

export default function Home() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGenerate = () => {
    setProblem(generateProblem());
    setShowAnswer(false);
  };

  const handleSolve = () => {
    if (problem) setShowAnswer(true);
  };

  const answer = problem
    ? problem.type === "multiplication"
      ? problem.a * problem.b
      : problem.quotient
    : null;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      {/* 标题栏 */}
      <div
        className="px-5 py-4 text-center text-white text-xl font-bold"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        乘除法竖式练习
      </div>

      {/* 题目区 */}
      <div className="px-5 py-6 text-center" style={{ background: "#f8f9fa" }}>
        {problem ? (
          <div className="text-3xl font-bold text-gray-800">
            {problem.type === "multiplication"
              ? `${problem.a} × ${problem.b}`
              : `${problem.dividend} ÷ ${problem.divisor}`}
            {showAnswer && answer !== null && (
              <span>
                {" "} = <span className="text-red-600">{answer}</span>
              </span>
            )}
            {!showAnswer && " = ?"}
          </div>
        ) : (
          <div className="text-lg text-gray-400">点击下方「出题」开始练习</div>
        )}
      </div>

      {/* 竖式区 */}
      <div className="flex-1 flex items-center justify-center px-5 py-6">
        {showAnswer && problem ? (
          problem.type === "multiplication" ? (
            <MultiplicationVertical a={problem.a} b={problem.b} />
          ) : (
            <DivisionVertical
              dividend={problem.dividend}
              divisor={problem.divisor}
              quotient={problem.quotient}
            />
          )
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-2">📝</div>
            <div>点击下方「解答」按钮查看竖式过程</div>
          </div>
        )}
      </div>

      {/* 按钮区 */}
      <div className="px-5 pb-6 flex gap-3">
        <button
          onClick={handleGenerate}
          className="flex-1 py-3.5 rounded-xl text-white text-lg font-bold border-none cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #43A047, #66BB6A)",
            boxShadow: "0 2px 8px rgba(67,160,71,0.3)",
          }}
        >
          出题
        </button>
        <button
          onClick={handleSolve}
          disabled={!problem}
          className="flex-1 py-3.5 rounded-xl text-white text-lg font-bold border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #1E88E5, #42A5F5)",
            boxShadow: problem ? "0 2px 8px rgba(30,136,229,0.3)" : "none",
          }}
        >
          解答
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 components 目录**

Run: `mkdir -p app/components`

- [ ] **Step 3: 创建占位组件（确保构建通过）**

创建 `app/components/MultiplicationVertical.tsx`：

```tsx
export default function MultiplicationVertical({ a, b }: { a: number; b: number }) {
  return <div>MultiplicationVertical: {a} × {b}</div>;
}
```

创建 `app/components/DivisionVertical.tsx`：

```tsx
export default function DivisionVertical({
  dividend,
  divisor,
  quotient,
}: {
  dividend: number;
  divisor: number;
  quotient: number;
}) {
  return <div>DivisionVertical: {dividend} ÷ {divisor} = {quotient}</div>;
}
```

- [ ] **Step 4: 验证构建和运行**

Run: `npm run build`
Expected: 构建成功

Run: `npm run dev &` 然后打开浏览器验证页面布局
Expected: 标题栏、题目区、竖式区、按钮区正确显示，点击出题生成随机题目，点击解答显示占位文字

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/components/
git commit -m "feat: add main page with problem generation and layout"
```

---

### Task 3: 乘法竖式组件

**Files:**
- Modify: `app/components/MultiplicationVertical.tsx`

- [ ] **Step 1: 实现乘法竖式组件**

```tsx
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

function toDigits(n: number): string[] {
  return String(n).split("");
}

interface CellProps {
  char: string;
  bg: string;
  color: string;
  bold?: boolean;
  large?: boolean;
}

function Cell({ char, bg, color, bold, large }: CellProps) {
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 8,
        padding: "4px 8px",
        fontWeight: bold ? "bold" : "normal",
        fontSize: large ? 26 : 24,
        minWidth: 36,
        textAlign: "center",
        display: "inline-block",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {char}
    </span>
  );
}

function SymbolCell({ char }: { char: string }) {
  return (
    <span
      style={{
        color: SYMBOL_COLOR,
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        display: "inline-block",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {char}
    </span>
  );
}

function EmptyCell() {
  return <span style={{ display: "inline-block" }} />;
}

function Line({ cols }: { cols: number }) {
  return (
    <div
      style={{
        borderBottom: `3px solid ${LINE_COLOR}`,
        gridColumn: `span ${cols}`,
      }}
    />
  );
}

interface PartialProduct {
  value: number;
  digitIndex: number;
}

function computePartialProducts(a: number, b: number): PartialProduct[] {
  const bDigits = toDigits(b);
  const products: PartialProduct[] = [];
  for (let i = bDigits.length - 1; i >= 0; i--) {
    const digitVal = parseInt(bDigits[i], 10);
    const placeOffset = bDigits.length - 1 - i;
    const partial = a * digitVal;
    products.push({ value: partial, digitIndex: placeOffset });
  }
  return products;
}

export default function MultiplicationVertical({ a, b }: { a: number; b: number }) {
  const product = a * b;
  const aDigits = toDigits(a);
  const bDigits = toDigits(b);
  const productDigits = toDigits(product);

  const partialProducts = computePartialProducts(a, b);

  const maxDigits = Math.max(
    aDigits.length + 1,
    productDigits.length,
    ...partialProducts.map(
      (p) => toDigits(p.value).length + p.digitIndex
    )
  );

  const totalCols = maxDigits + 1; // +1 for symbol column

  const colTemplate = `24px repeat(${maxDigits}, 36px)`;

  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: colTemplate,
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Row: multiplicand (a) */}
      <EmptyCell />
      {padAndRender(aDigits, maxDigits, (ch) => (
        <Cell char={ch} bg={GREEN_BG} color={GREEN_TEXT} bold />
      ))}

      {/* Row: × multiplier (b) */}
      {/* Find which column the × should be in - it goes right before the first digit of b */}
      <EmptyCell />
      {padAndRenderWithSymbol(
        bDigits,
        maxDigits,
        "×",
        (ch) => <Cell char={ch} bg={BLUE_BG} color={BLUE_TEXT} bold />
      )}

      {/* Line */}
      <EmptyCell />
      <Line cols={maxDigits} />

      {/* Partial products */}
      {partialProducts.map((pp, idx) => {
        const ppDigits = toDigits(pp.value);
        const leadingZeros = pp.digitIndex;
        const totalLen = ppDigits.length + leadingZeros;
        const leftPad = maxDigits - totalLen;

        return (
          <span key={idx}>
            {/* Symbol column: + for rows after the first */}
            {idx > 0 ? <SymbolCell char="+" /> : <EmptyCell />}

            {/* Left padding */}
            {Array.from({ length: leftPad }).map((_, i) => (
              <EmptyCell key={`lp-${i}`} />
            ))}

            {/* Digits */}
            {ppDigits.map((ch) => (
              <Cell key={ch + i} char={ch} bg={ORANGE_BG} color={ORANGE_TEXT} bold />
            ))}

            {/* Trailing zeros for place value */}
            {Array.from({ length: leadingZeros }).map((_, i) => (
              <Cell key={`z-${i}`} char="0" bg={ORANGE_BG} color={ORANGE_TEXT} bold />
            ))}
          </span>
        );
      })}

      {/* Line */}
      <EmptyCell />
      <Line cols={maxDigits} />

      {/* Row: product */}
      <EmptyCell />
      {padAndRender(productDigits, maxDigits, (ch) => (
        <Cell char={ch} bg={RED_BG} color={RED_TEXT} bold large />
      ))}
    </div>
  );
}

function padAndRender(
  digits: string[],
  maxLen: number,
  render: (ch: string) => React.ReactNode
) {
  const pad = maxLen - digits.length;
  return (
    <>
      {Array.from({ length: pad }).map((_, i) => (
        <EmptyCell key={`p-${i}`} />
      ))}
      {digits.map((ch) => render(ch))}
    </>
  );
}

function padAndRenderWithSymbol(
  digits: string[],
  maxLen: number,
  _symbol: string,
  render: (ch: string) => React.ReactNode
) {
  // The × symbol goes right before the first digit
  // which is at position (maxLen - digits.length) in the grid
  // but we already used the symbol column, so we need maxLen - digits.length empty cells
  const pad = maxLen - digits.length;
  // But × should be right before the first digit, so pad-1 empty cells then × then rest
  // Actually the symbol is in the symbol column already. We just need empty cells before the digits.
  return (
    <>
      {Array.from({ length: pad }).map((_, i) => (
        <EmptyCell key={`p-${i}`} />
      ))}
      {digits.map((ch) => render(ch))}
    </>
  );
}
```

- [ ] **Step 2: 验证构建**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 手动测试**

Run: `npm run dev` → 打开浏览器 → 点击出题直到出现乘法题 → 点击解答
Expected: 彩色竖式正确显示，数字对齐，颜色正确

测试用例（多刷几次出题覆盖）：
- 一位数 × 一位数：如 5 × 3
- 两位数 × 一位数：如 23 × 5
- 两位数 × 两位数：如 23 × 15（多个部分积，+号对齐）
- 三位数结果：如 99 × 99

- [ ] **Step 4: Commit**

```bash
git add app/components/MultiplicationVertical.tsx
git commit -m "feat: implement multiplication vertical component"
```

---

### Task 4: 除法竖式组件

**Files:**
- Modify: `app/components/DivisionVertical.tsx`

这是最复杂的组件。长除法需要处理逐步减法、落位、符号位置等。

- [ ] **Step 1: 实现除法竖式组件**

```tsx
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

function toDigits(n: number): string[] {
  return String(n).split("");
}

interface DivisionStep {
  quotientDigit: number;
  portion: number;
  subtractValue: number;
  remainder: number;
  broughtDownDigit?: number;
  portionDigits: number;
  subtractDigits: number;
}

function computeDivisionSteps(
  dividend: number,
  divisor: number,
  quotient: number
): { steps: DivisionStep[]; quotientDigits: string[] } {
  const quotientDigits = toDigits(quotient);
  const dividendDigits = toDigits(dividend);
  const steps: DivisionStep[] = [];

  let currentPortion = 0;
  let digitIndex = 0;

  for (let i = 0; i < quotientDigits.length; i++) {
    const qDigit = parseInt(quotientDigits[i], 10);

    while (
      currentPortion < divisor &&
      digitIndex < dividendDigits.length
    ) {
      currentPortion = currentPortion * 10 + parseInt(dividendDigits[digitIndex], 10);
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
      portionDigits: toDigits(currentPortion).length,
      subtractDigits: toDigits(subtractValue).length,
    });

    currentPortion = remainder;
  }

  return { steps, quotientDigits };
}

interface CellProps {
  char: string;
  bg: string;
  color: string;
  bold?: boolean;
  large?: boolean;
}

function Cell({ char, bg, color, bold, large }: CellProps) {
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 8,
        padding: "4px 8px",
        fontWeight: bold ? "bold" : "normal",
        fontSize: large ? 26 : 24,
        minWidth: 36,
        textAlign: "center",
        display: "inline-block",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {char}
    </span>
  );
}

function SymbolCell({ char }: { char: string }) {
  return (
    <span
      style={{
        color: SYMBOL_COLOR,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        display: "inline-block",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {char}
    </span>
  );
}

function EmptyCell() {
  return <span style={{ display: "inline-block" }} />;
}

function Line({ cols }: { cols: number }) {
  return (
    <div
      style={{
        borderBottom: `3px solid ${LINE_COLOR}`,
        gridColumn: `span ${cols}`,
      }}
    />
  );
}

interface DivisionVerticalProps {
  dividend: number;
  divisor: number;
  quotient: number;
}

export default function DivisionVertical({
  dividend,
  divisor,
  quotient,
}: DivisionVerticalProps) {
  const dividendDigits = toDigits(dividend);
  const divisorDigits = toDigits(divisor);
  const quotientDigits = toDigits(quotient);

  const { steps } = computeDivisionSteps(dividend, divisor, quotient);

  const numCols = dividendDigits.length; // number of digit columns in bracket area
  const bracketColTemplate = `20px repeat(${numCols}, 36px)`;

  // Calculate left offset for quotient (aligned right with dividend)
  const quotientLeftPad = numCols - quotientDigits.length;
  // Divisor width in px
  const divisorWidth = divisorDigits.length * 40 + 10; // approximate
  const quotientMarginLeft = divisorWidth + 10 + quotientLeftPad * 40;

  return (
    <div
      style={{
        fontFamily: "'Courier New', monospace",
        display: "inline-flex",
        flexDirection: "column",
      }}
    >
      {/* Quotient row (above bracket line) */}
      <div style={{ display: "flex", marginLeft: quotientMarginLeft }}>
        {quotientDigits.map((ch, i) => (
          <Cell key={i} char={ch} bg={RED_BG} color={RED_TEXT} bold />
        ))}
      </div>

      {/* Main area: divisor + bracket + content */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* Divisor */}
        <div style={{ display: "flex", gap: 4, paddingRight: 6, alignItems: "center" }}>
          {divisorDigits.map((ch, i) => (
            <Cell key={i} char={ch} bg={BLUE_BG} color={BLUE_TEXT} bold />
          ))}
        </div>

        {/* Bracket area */}
        <div
          style={{
            borderLeft: `3px solid ${LINE_COLOR}`,
            borderTop: `3px solid ${LINE_COLOR}`,
            padding: "4px 8px 0 10px",
          }}
        >
          <div
            style={{
              display: "inline-grid",
              gridTemplateColumns: bracketColTemplate,
              alignItems: "center",
              gap: 0,
            }}
          >
            {/* Row: dividend */}
            <EmptyCell />
            {dividendDigits.map((ch, i) => (
              <Cell key={i} char={ch} bg={GREEN_BG} color={GREEN_TEXT} bold />
            ))}

            {/* Steps */}
            {steps.map((step, stepIdx) => {
              const rows: React.ReactNode[] = [];

              // Subtract row: -subtractValue
              const subDigits = toDigits(step.subtractValue);
              const subLeftPad = numCols - step.portionDigits;
              const minusCol = subLeftPad + 1; // 1-indexed, minus goes right before digits

              rows.push(
                <div key={`sub-${stepIdx}`} style={{ display: "contents" }}>
                  {Array.from({ length: numCols + 1 }).map((_, col) => {
                    if (col === 0) {
                      return <span key={`mc-${col}`} />;
                    }
                    const digitPos = col - subLeftPad; // position within subDigits (0-indexed from left of number)
                    if (col === minusCol) {
                      return <SymbolCell key={`mc-${col}`} char="−" />;
                    }
                    if (digitPos >= 0 && digitPos < subDigits.length) {
                      return (
                        <Cell
                          key={`mc-${col}`}
                          char={subDigits[digitPos]}
                          bg={ORANGE_BG}
                          color={ORANGE_TEXT}
                          bold
                        />
                      );
                    }
                    return <EmptyCell key={`mc-${col}`} />;
                  })}
                </div>
              );

              // Line after subtract
              rows.push(
                <div key={`line1-${stepIdx}`} style={{ display: "contents" }}>
                  <EmptyCell />
                  <Line cols={numCols} />
                </div>
              );

              // Remainder row (may include brought-down digit)
              if (stepIdx < steps.length - 1 || step.remainder > 0 || step.broughtDownDigit !== undefined) {
                const remainderDigits = toDigits(step.remainder);
                const remainderPortion = step.broughtDownDigit !== undefined
                  ? step.remainder * 10 + step.broughtDownDigit
                  : step.remainder;
                const fullDigits = toDigits(remainderPortion);
                const fullLeftPad = numCols - fullDigits.length;

                rows.push(
                  <div key={`rem-${stepIdx}`} style={{ display: "contents" }}>
                    <EmptyCell />
                    {Array.from({ length: numCols }).map((_, col) => {
                      const digitPos = col - fullLeftPad;
                      if (digitPos >= 0 && digitPos < fullDigits.length) {
                        const isBroughtDown =
                          step.broughtDownDigit !== undefined &&
                          digitPos === fullDigits.length - 1;
                        return (
                          <Cell
                            key={`rc-${col}`}
                            char={fullDigits[digitPos]}
                            bg={isBroughtDown ? GREEN_BG : ORANGE_BG}
                            color={isBroughtDown ? GREEN_TEXT : ORANGE_TEXT}
                            bold
                          />
                        );
                      }
                      return <EmptyCell key={`rc-${col}`} />;
                    })}
                  </div>
                );

                // If this is the last step and remainder is 0, show it
                if (stepIdx === steps.length - 1 && step.remainder === 0) {
                  // The 0 was already shown above via fullDigits
                }
              }

              return rows;
            })}

            {/* Final line (if there's a last remainder) */}
            {steps.length > 1 && (
              <div style={{ display: "contents" }}>
                <EmptyCell />
                <Line cols={numCols} />
              </div>
            )}

            {/* Final remainder */}
            {(() => {
              const lastStep = steps[steps.length - 1];
              if (lastStep.remainder === 0) {
                const zeroLeftPad = numCols - 1;
                return (
                  <div style={{ display: "contents" }}>
                    <EmptyCell />
                    {Array.from({ length: numCols }).map((_, col) => {
                      if (col === numCols - 1) {
                        return (
                          <Cell
                            key={`fc-${col}`}
                            char="0"
                            bg={GREEN_BG}
                            color={GREEN_TEXT}
                            bold
                          />
                        );
                      }
                      return <EmptyCell key={`fc-${col}`} />;
                    })}
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证构建**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 手动测试**

Run: `npm run dev` → 打开浏览器 → 点击出题直到出现除法题 → 点击解答

测试用例：
- 简单整除：如 20 ÷ 4
- 两位数除法：如 345 ÷ 15（两位商，有落位）
- 大数除法：如 10000 ÷ 100

验证点：
- 商在被除数上方右对齐
- 减号紧贴数字左侧
- 落下来的数字保持绿色
- 所有中间过程数字为橙色
- 余数为绿色
- 除号 L 形完整

- [ ] **Step 4: Commit**

```bash
git add app/components/DivisionVertical.tsx
git commit -m "feat: implement division vertical component"
```

---

### Task 5: 竖式组件优化和边界情况处理

**Files:**
- Modify: `app/components/MultiplicationVertical.tsx`
- Modify: `app/components/DivisionVertical.tsx`

- [ ] **Step 1: 优化乘法竖式的 × 符号位置**

× 应该紧贴乘数的第一个数字左侧，而非固定在最左列。

检查 `padAndRenderWithSymbol` 函数：× 符号列的符号实际上已经通过空列放在了乘数数字的紧左侧。如果发现 × 与数字之间有空列，需要调整 `pad` 的计算：将 × 放在 `pad - 1` 的空格位置。

具体做法：修改乘法行，将 `×` 符号直接放在乘数第一个数字的前一个 grid cell 中，而不是固定的 col 1。这需要将 × 的渲染与数字行合并，用 `grid-column` 控制位置。

如果当前效果正确（× 紧贴 15），跳过此步骤。

- [ ] **Step 2: 处理除法的特殊情况**

确保以下边界情况正确渲染：

- 被除数位数多于除数：如 9801 ÷ 99 = 99
- 商中间有 0 的情况（不会出现，因为除数 ≤100 且被除数 ≤10000，但以防万一）：如果 quotient 中某个数位为 0，该步骤的 subtractValue 为 0，需要正确处理
- 一位数除法：如 8 ÷ 2 = 4

对每种情况在浏览器中测试，如果有渲染问题则修复。

- [ ] **Step 3: 验证构建**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add app/components/
git commit -m "fix: refine vertical component alignment and edge cases"
```

---

### Task 6: 最终集成测试和清理

**Files:**
- Review all files

- [ ] **Step 1: 全面手动测试**

Run: `npm run dev` → 打开浏览器

测试清单：
- [ ] 连续出题 10 次，检查乘法和除法都出现
- [ ] 乘法：一位数 × 一位数、两位数 × 两位数、大数（如 99×99）
- [ ] 除法：一位数商、两位数商、大被除数（如 10000÷100）
- [ ] 颜色一致性：绿色原始数、蓝色运算数、橙色中间过程、红色结果和符号
- [ ] 数字对齐：所有数位垂直对齐
- [ ] 减号和加号紧贴数字
- [ ] 除号 L 形完整
- [ ] 出题时清除上一题的解答状态
- [ ] 未出题时解答按钮禁用

- [ ] **Step 2: 删除占位文件（如果有）**

检查是否有 `req.md` 等非项目文件需要保留或清理（由用户决定）。

- [ ] **Step 3: 最终构建验证**

Run: `npm run build`
Expected: 构建成功，无 warning

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete vertical math practice app"
```

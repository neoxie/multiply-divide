# 取值范围设置功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为乘除法竖式练习工具添加可配置的取值范围设置（乘数A/B、除数、商），持久化到 localStorage。

**Architecture:** 新建 `useSettings` hook 管理 localStorage 读写，在 `page.tsx` 中内联设置面板，修改 `generateProblem` 接受 settings 参数。

**Tech Stack:** React 19, TypeScript 5, localStorage API

---

### Task 1: 创建 useSettings Hook

**Files:**
- Create: `app/hooks/useSettings.ts`

- [ ] **Step 1: 创建 hooks 目录和 useSettings.ts 文件**

创建 `app/hooks/useSettings.ts`，包含类型定义和 hook 实现：

```typescript
'use client';

import { useState, useCallback } from "react";

export interface RangeConfig {
  min: number;
  max: number;
}

export interface RangeSettings {
  multiplierA: RangeConfig;
  multiplierB: RangeConfig;
  divisor: RangeConfig;
  quotient: RangeConfig;
}

const DEFAULT_SETTINGS: RangeSettings = {
  multiplierA: { min: 1, max: 100 },
  multiplierB: { min: 1, max: 100 },
  divisor: { min: 1, max: 100 },
  quotient: { min: 1, max: 100 },
};

const STORAGE_KEY = "multiply-divide-settings";
const MIN_VAL = 1;
const MAX_VAL = 1000;

function clamp(value: number): number {
  return Math.max(MIN_VAL, Math.min(MAX_VAL, value));
}

function loadSettings(): RangeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RangeSettings;
      // Validate all fields exist and are in range
      const keys = Object.keys(DEFAULT_SETTINGS) as (keyof RangeSettings)[];
      for (const key of keys) {
        if (!parsed[key] || typeof parsed[key].min !== 'number' || typeof parsed[key].max !== 'number') {
          return DEFAULT_SETTINGS;
        }
      }
      return parsed;
    }
  } catch {
    // localStorage unavailable or JSON parse error — silent fallback
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: RangeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable — silent fallback
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<RangeSettings>(loadSettings);

  const updateRange = useCallback(
    (key: keyof RangeSettings, field: "min" | "max", value: number) => {
      setSettings((prev) => {
        const clamped = clamp(value);
        const range = { ...prev[key], [field]: clamped };

        // Auto-swap if min > max
        if (range.min > range.max) {
          const temp = range.min;
          range.min = range.max;
          range.max = temp;
        }

        const next = { ...prev, [key]: range };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  return { settings, updateRange };
}
```

- [ ] **Step 2: 验证 TypeScript 编译通过**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add app/hooks/useSettings.ts
git commit -m "feat: add useSettings hook with localStorage persistence"
```

---

### Task 2: 修改 generateProblem 接受 settings 参数

**Files:**
- Modify: `app/page.tsx:19-34`

- [ ] **Step 1: 添加 randInRange 辅助函数并修改 generateProblem**

在 `app/page.tsx` 中：

1. 在文件顶部 import `RangeSettings` 类型：

```typescript
import { RangeSettings } from "./hooks/useSettings";
```

2. 在 `generateProblem` 函数之前添加 `randInRange` 辅助函数（约第 18 行）：

```typescript
function randInRange({ min, max }: { min: number; max: number }): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

3. 修改 `generateProblem` 函数签名和实现（第 19-34 行）：

```typescript
function generateProblem(problemType: ProblemType, settings: RangeSettings): Problem {
  const isMultiplication =
    problemType === "multiplication" ||
    (problemType === "random" && Math.random() < 0.5);

  if (isMultiplication) {
    const a = randInRange(settings.multiplierA);
    const b = randInRange(settings.multiplierB);
    return { type: "multiplication", a, b };
  } else {
    const divisor = randInRange(settings.divisor);
    const quotient = randInRange(settings.quotient);
    const dividend = divisor * quotient;
    return { type: "division", dividend, divisor, quotient };
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译通过**

Run: `npx tsc --noEmit`
Expected: 无错误（`handleGenerate` 调用处会暂时报错，Task 3 修复）

---

### Task 3: 集成 useSettings Hook 和设置面板 UI

**Files:**
- Modify: `app/page.tsx:36-161` (Home 组件)

- [ ] **Step 1: 在 Home 组件中引入 useSettings 并修改 handleGenerate**

修改 `app/page.tsx` 中 Home 组件：

1. 导入 `useSettings`（第 4 行区域添加）：

```typescript
import { useSettings } from "./hooks/useSettings";
```

2. 在 `Home` 组件中添加 hook 调用（第 37 行之后）：

```typescript
const { settings, updateRange } = useSettings();
```

3. 修改 `handleGenerate`（第 41-44 行）：

```typescript
const handleGenerate = () => {
  setProblem(generateProblem(problemType, settings));
  setShowAnswer(false);
};
```

- [ ] **Step 2: 添加设置面板 UI**

在控制区按钮行（`</div>` 结束约第 118 行）之后、题目行之前插入设置面板。

添加一个 `RangeInput` 内联辅助组件用于减少重复代码：

```tsx
{/* 范围输入辅助组件 */}
const RangeInput = ({ label, config, configKey }: {
  label: string;
  config: { min: number; max: number };
  configKey: keyof RangeSettings;
}) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs text-gray-500 font-medium w-10 text-right">{label}</span>
    <input
      type="number"
      min={1}
      max={1000}
      value={config.min}
      onChange={(e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v)) updateRange(configKey, "min", v);
      }}
      className="w-14 px-1.5 py-1 text-center text-sm border rounded"
      style={{ borderColor: "#d1d5db" }}
    />
    <span className="text-xs text-gray-400">-</span>
    <input
      type="number"
      min={1}
      max={1000}
      value={config.max}
      onChange={(e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v)) updateRange(configKey, "max", v);
      }}
      className="w-14 px-1.5 py-1 text-center text-sm border rounded"
      style={{ borderColor: "#d1d5db" }}
    />
  </div>
);
```

然后在按钮行 `</div>` 之后插入设置面板（约第 118 行之后）：

```tsx
{/* 设置面板 */}
<div className="flex flex-col items-center gap-2 px-5 py-2">
  {(problemType === "multiplication" || problemType === "random") && (
    <div className="flex items-center gap-6">
      <RangeInput label="乘数A" config={settings.multiplierA} configKey="multiplierA" />
      <RangeInput label="乘数B" config={settings.multiplierB} configKey="multiplierB" />
    </div>
  )}
  {(problemType === "division" || problemType === "random") && (
    <div className="flex items-center gap-6">
      <RangeInput label="除数" config={settings.divisor} configKey="divisor" />
      <RangeInput label="商" config={settings.quotient} configKey="quotient" />
    </div>
  )}
</div>
```

**注意：** `RangeInput` 不能直接定义在 `Home` 组件内部（因为它会访问闭包中的 `updateRange`）。需要将 `RangeInput` 定义在 `Home` 组件内，或者改为传入 `updateRange` 作为 prop。推荐定义在 `Home` 组件内部（JSX 的函数组件模式），因为它依赖 `updateRange` 闭包。

- [ ] **Step 3: 验证编译和运行**

Run: `npx tsc --noEmit`
Expected: 无错误

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 4: 手动测试**

Run: `npm run dev`

测试场景：
1. 乘法模式：设置面板显示"乘数A"和"乘数B"，不显示除法设置
2. 除法模式：设置面板显示"除数"和"商"，不显示乘法设置
3. 随机模式：全部显示
4. 修改范围后出题，验证数字在设定范围内
5. 刷新页面，验证设置被保留

- [ ] **Step 5: 提交**

```bash
git add app/page.tsx
git commit -m "feat: add range settings UI with localStorage persistence"
```

---

### Task 4: 最终验证

- [ ] **Step 1: 运行 lint 检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 端到端手动验证**

Run: `npm run dev`

验证清单：
- [ ] 设置面板在控制区下方正确显示
- [ ] 切换题目类型时设置面板正确切换
- [ ] 输入范围值后出题，数字符合设定范围
- [ ] 输入 min > max 时自动交换
- [ ] 输入超出 1-1000 时被 clamp
- [ ] 刷新页面后设置保留
- [ ] 清除 localStorage 后恢复默认值

# 取值范围设置功能设计

## 概述

为乘除法竖式练习工具增加取值范围设置功能，允许用户分别配置乘数A、乘数B、除数和商的最小值和最大值（1-1000），设置持久化到 localStorage。

## 数据模型

```typescript
interface RangeConfig {
  min: number; // >= 1
  max: number; // <= 1000
}

interface RangeSettings {
  multiplierA: RangeConfig; // 乘数A范围
  multiplierB: RangeConfig; // 乘数B范围
  divisor: RangeConfig;     // 除数范围
  quotient: RangeConfig;    // 商范围
}
```

默认值：所有字段 `{ min: 1, max: 100 }`。

localStorage key: `"multiply-divide-settings"`，值为 JSON 字符串。

## 架构

### 新增文件

- `app/hooks/useSettings.ts` — 自定义 hook，管理 localStorage 读写和状态

### 修改文件

- `app/page.tsx` — 集成 useSettings hook，添加设置面板 UI，修改 generateProblem 调用

### 不修改文件

- `app/components/MultiplicationVertical.tsx` — 不变
- `app/components/DivisionVertical.tsx` — 不变
- `app/globals.css` — 不变

## useSettings Hook

职责：
- 初始化时从 localStorage 读取设置，解析失败用默认值
- 暴露 `settings` 状态和 `updateRange` 方法
- `updateRange(key, field, value)` — 更新单个字段并写入 localStorage
- 输入校验：clamp 到 1-1000，如果 min > max 则自动交换两者

接口：

```typescript
function useSettings(): {
  settings: RangeSettings;
  updateRange: (key: keyof RangeSettings, field: 'min' | 'max', value: number) => void;
}
```

## UI 布局

设置面板内联在控制区按钮行和题目行之间，始终可见。

```
┌─────────────────────────────────────────────────┐
│ [乘法] [除法] [随机]     [出题] [解答]           │  现有按钮行
├─────────────────────────────────────────────────┤
│ 乘数A [1]-[100]  乘数B [1]-[100]                │  设置行（乘法/随机时显示）
│ 除数  [1]-[100]  商   [1]-[100]                 │  设置行（除法/随机时显示）
├─────────────────────────────────────────────────┤
│ 题目显示行                                       │  现有
└─────────────────────────────────────────────────┘
```

动态显示规则：
- 题目类型为"乘法"：显示乘数A、乘数B设置行
- 题目类型为"除法"：显示除数、商设置行
- 题目类型为"随机"：全部显示

输入框使用 `input type="number"`，紧凑排列，内联样式匹配现有控制区设计。

## generateProblem 修改

新增辅助函数 `randInRange`:

```typescript
function randInRange({ min, max }: RangeConfig): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

修改 `generateProblem` 签名，接受 settings 参数：

```typescript
function generateProblem(problemType: ProblemType, settings: RangeSettings): Problem
```

- 乘法：`a = randInRange(settings.multiplierA)`, `b = randInRange(settings.multiplierB)`
- 除法：`divisor = randInRange(settings.divisor)`, `quotient = randInRange(settings.quotient)`, `dividend = divisor * quotient`

## 输入校验规则

1. 数值 clamp 到 [1, 1000] 范围
2. 如果用户输入 min > max，自动交换两者
3. 空输入或无效输入保持上一次有效值

## 错误处理

- localStorage 不可用（隐私模式等）时静默降级，仅使用内存状态
- JSON 解析失败使用默认值

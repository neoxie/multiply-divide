# 出题类型选择器设计

## 概述

在主界面添加 Segment 标签切换控件，允许用户选择出题类型：乘法、除法或随机。

## 状态设计

```typescript
type ProblemType = "multiplication" | "division" | "random";

// 新增 useState
const [problemType, setProblemType] = useState<ProblemType>("random");
```

默认值为 `"random"`，保持当前行为。

## UI 布局

在标题和题目显示区之间新增一行 Segment 按钮：

```
┌───────────────────────────┐
│    乘除法竖式练习         │
│                           │
│  [乘法] [除法] [随机]     │
│                           │
│     23 × 45 = ?          │
│                           │
│   [出题]    [解答]        │
└───────────────────────────┘
```

- 选中项：紫色背景（主题色），白色文字
- 未选中项：灰色背景，深色文字
- 圆角按钮，水平排列

## 出题逻辑

修改 `generateProblem()` 函数，接受 `problemType` 参数：

- `"random"`：保持 50/50 随机
- `"multiplication"`：只生成乘法题
- `"division"`：只生成除法题

## 影响范围

仅修改 `app/page.tsx`：
- 新增 `problemType` state
- 新增 Segment 按钮 UI
- 修改 `generateProblem()` 逻辑

不涉及 `MultiplicationVertical` 和 `DivisionVertical` 组件。

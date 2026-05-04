# 乘除法竖式练习

小学生整数乘除法竖式计算练习工具。

## 技术栈

- Next.js 16 (App Router) — **注意：API 与训练数据可能不同，参考 `node_modules/next/dist/docs/`**
- React 19 + TypeScript 5
- Tailwind CSS 4 (通过 `@tailwindcss/postcss`)
- 路径别名: `@/*` → `./*`

## 命令

```bash
npm run dev    # 开发服务器 (localhost:3000)
npm run build  # 生产构建
npm run lint   # ESLint 检查
```

## 项目结构

```
app/
  page.tsx                          # 主页面（题目生成 + 控制 + 展示）
  layout.tsx                        # 根布局 (zh-CN, Geist 字体)
  globals.css                       # Tailwind + 竖式颜色 CSS 变量
  components/
    MultiplicationVertical.tsx       # 乘法竖式组件
    DivisionVertical.tsx            # 除法竖式组件
```

## 竖式颜色体系 (globals.css)

| 变量 | 用途 |
|------|------|
| `--color-green-*` | 最终答案 |
| `--color-blue-*` | 进位/借位 |
| `--color-orange-*` | 中间计算步骤 |
| `--color-red-*` | 余数/错误标记 |
| `--color-symbol` | 运算符号 |

## 开发注意

- 全部为客户端渲染 (`'use client'`)，无服务端组件
- 除法题目通过 `divisor * quotient = dividend` 生成，保证整除
- 桌面端竖式区域使用 `transform: scale(1.8)` 放大显示
- UI 使用内联 style 而非 Tailwind 类名定义渐变和复杂样式

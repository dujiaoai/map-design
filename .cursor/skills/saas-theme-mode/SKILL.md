---
name: saas-theme-mode
description: >-
  Dark-only theme standards for map-design: html.dark class, semantic CSS tokens
  from @repo/ui globals, Tailwind dark: variants, and workspace chrome patterns.
  Use when creating or styling any React component, page CSS, or @repo/ui
  primitive—even if the user only says "fix colors" or "dark mode".
metadata:
  author: map-design
  version: "1.1.0"
compatibility: Requires @repo/ui globals.css, ThemeProvider, Tailwind v4 dark variant.
---

# 深色主题标准（map-design）

产品 **仅支持深色模式**（无浅色切换）。Web 与 Admin 固定 `html.dark`。

## 先读

| 主题 | 文档 |
| --- | --- |
| Token 与写法 | [references/tokens-and-patterns.md](references/tokens-and-patterns.md) |
| 全局变量 | `packages/ui/src/styles/globals.css` |
| 工作台样式 | `apps/web/app/routes/home.css`（`html.dark .workspace-page`） |

相关 Skill：`repo-ui-package`（改 globals）、`frontend-design`（视觉方向）。

## 机制（勿改约定）

| 项 | 实现 |
| --- | --- |
| 模式 | 固定 **`html.dark`**（非 `prefers-color-scheme` 驱动） |
| 初始化 | `ThemeProvider`（`features/theme`）+ `root.tsx` 内联 `themeInitScript` |
| 持久化 | `localStorage` 写入 `dark`（`yunyan-theme` / `yunyan-admin-theme`） |
| Tailwind | `@custom-variant dark (&:is(.dark *));` in globals.css |

不要新增主题切换 UI 或第二套 storage key。

## 组件样式优先级（必须按序）

1. **语义 Token** — `bg-background`、`text-foreground`、`border-border`、`text-muted-foreground`、`bg-muted`、`bg-card`、`bg-accent`、`text-primary`
2. **品牌 Token** — `text-brand-light`、`text-brand-deep`、`bg-brand-muted`、`text-brand-soft`
3. **`dark:` 微调** — 指挥舱玻璃/高对比：`dark:text-white/85`、`dark:border-white/10`、`dark:bg-white/5`
4. **页面级** — 工作台复杂表面：`home.css` 中 `html.dark .workspace-page …`
5. **共享 class 常量** — `WORKSPACE_CHROME_*`（`shared/lib/workspace-chrome-styles.ts`）

## 新组件 checklist

- [ ] 优先语义 class，避免裸 `#fff` / `#000` / 单色 hex
- [ ] 玻璃、边框、占位符不够时补 `dark:` 微调
- [ ] 工作台/widget：对照 `home.css` 暗色规则
- [ ] 改设计系统：只改 `globals.css` 的 `.dark`，不散落 app
- [ ] `@repo/ui` primitives：侧栏/浮层样式放 globals `@layer base`

## 特例

| 场景 | 说明 |
| --- | --- |
| **登录页** | 固定「暗色指挥舱」：`--surface-elevated`、`--text-on-dark` |
| **地图画布 HUD** | 默认偏暗；新 HUD 对齐 `home.css` 暗色块 |

## 禁止

- 恢复浅色模式或 `ThemeToggle`
- 仅用 `prefers-color-scheme` 做主题
- 硬编码 `#3094ff`（用 `primary` / `brand` / CSS 变量）
- 在组件内 `document.documentElement.classList` 切换主题

## 验证

```bash
pnpm --filter @repo/saas-web validate
pnpm --filter @repo/saas-admin validate
```

手动：打开工作台 / Admin → 检查侧栏、顶栏、工具条、浮层、Drawer 均为深色。

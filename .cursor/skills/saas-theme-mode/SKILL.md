---
name: saas-theme-mode
description: >-
  Light and dark theme standards for map-design: html.dark class, semantic CSS
  tokens from @repo/ui globals, Tailwind dark: variants, and workspace chrome
  patterns. Use when creating or styling any React component, page CSS, or
  @repo/ui primitive—even if the user only says "fix colors", "dark mode", or
  "make it work in light theme".
metadata:
  author: map-design
  version: "1.0.0"
compatibility: Requires @repo/ui globals.css, ThemeProvider, Tailwind v4 dark variant.
---

# 浅色 / 深色主题标准（map-design）

## 先读

| 主题 | 文档 |
| --- | --- |
| Token 与写法 | [references/tokens-and-patterns.md](references/tokens-and-patterns.md) |
| 全局变量 | `packages/ui/src/styles/globals.css` |
| 工作台浅色覆盖 | `apps/web/app/routes/home.css`（`html:not(.dark)` 块） |

相关 Skill：`repo-ui-package`（改 globals）、`frontend-design`（视觉方向）。

## 机制（勿改约定）

| 项 | 实现 |
| --- | --- |
| 切换 | `html` 上的 **`.dark` class**（非 `prefers-color-scheme` 单独驱动） |
| 状态 | `ThemeProvider` + `useTheme()`（`features/theme`） |
| 持久化 | `localStorage` 键 **`yunyan-theme`**（`light` \| `dark`） |
| 默认 | **dark** |
| 防闪烁 | `root.tsx` 内联 `themeInitScript`（`shared/lib/theme.ts`） |
| Tailwind | `@custom-variant dark (&:is(.dark *));` in globals.css |

不要新增第二套 theme state 或 storage key。

## 组件样式优先级（必须按序）

1. **语义 Token** — 两模式自动适配：`bg-background`、`text-foreground`、`border-border`、`text-muted-foreground`、`bg-muted`、`bg-card`、`bg-accent`、`text-primary`、`bg-primary`
2. **品牌 Token** — 两模式共用：`text-brand-light`、`text-brand-deep`、`bg-brand-muted`、`text-brand-soft`
3. **`dark:` 微调** — 指挥舱玻璃/高对比：`dark:text-white/85`、`dark:border-white/10`、`dark:bg-white/5`
4. **页面级浅色** — 工作台复杂表面：在 `home.css` 用 `html:not(.dark) .workspace-page …`
5. **共享 class 常量** — 顶栏/工具条：`WORKSPACE_CHROME_*`（`shared/lib/workspace-chrome-styles.ts`）

## 新组件 checklist

- [ ] 优先语义 class，避免裸 `#fff` / `#000` / 单色 hex
- [ ] 玻璃、边框、占位符在暗色下不够时补 `dark:`，浅色靠 `:root` 语义 token
- [ ] 工作台/widget：对照 `home.css` 是否需 `html:not(.dark)` 规则
- [ ] 改设计系统：只改 `globals.css` 的 `:root` / `.dark`，不散落 app
- [ ] 自测：顶栏 `ThemeToggle` 切换两种模式
- [ ] `@repo/ui`  primitives：暗色侧栏/浮层样式放 globals `@layer base`（已有 sidebar、drawer 示例）

## 特例

| 场景 | 说明 |
| --- | --- |
| **登录页** | 固定「暗色指挥舱」视觉，可用 `--surface-elevated`、`--text-on-dark`；不必随浅色工作台同款 |
| **地图画布 HUD** | 默认偏暗；浅色模式依赖 `home.css` 覆盖块，新 HUD 须同步添加 |

## 禁止

- 仅用 `prefers-color-scheme` 做主题（须与 `.dark` class 一致）
- 硬编码 `#3094ff`（用 `primary` / `brand` / CSS 变量）
- 只写 `text-white` / `bg-[#07111f]` 且无浅色对应
- 在组件内 `document.documentElement.classList` 切换主题（用 `useTheme`）
- 在 `packages/ui` 写死仅深色或仅浅色的 hex，而不走 token

## 验证

```bash
pnpm --filter @repo/saas-web validate
node .cursor/skills/scripts/validate-skills.mjs
```

手动：打开工作台 → `ThemeToggle` → 检查侧栏、顶栏、工具条、浮层、Drawer。

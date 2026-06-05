# 前端工程规范

## 技术栈

| 类别 | 选型 |
| --- | --- |
| UI | React 19、TypeScript |
| 路由 | React Router 7.16 Framework |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS v4 |
| 组件 | `@haoxuan/ui`（`saas/packages/ui`） |

不含 i18n，UI 固定中文。

## 目录（FSD 简化）

```
app/
├── routes.ts
├── root.tsx
├── routes/
├── features/
├── entities/
├── shared/
└── widgets/
```

## 横切能力

| 能力 | 选型 |
| --- | --- |
| 路由守卫 | `clientLoader` + `redirect` |
| 状态 | Zustand + TanStack Query |
| 表单 | React Hook Form + Zod（`features/profile` 示例） |
| Lint / Format | Biome（`saas/biome.json`，覆盖 apps/packages/cloud） |
| 测试 | Vitest + RTL + Playwright |
| 错误 | ErrorBoundary + Sentry |

## Vite 配置约定

```ts
const monorepoRoot = path.resolve(__dirname, '../../..')
const uiDir = path.resolve(__dirname, '../../packages/ui')
```

`app/app.css`：

```css
@import "../../../packages/ui/src/styles/globals.css";
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

## SPA 模式

Web / Admin 使用 `react-router.config.ts` 中 `ssr: false`，产出 `build/client/`。

## 地图工作台（saas-web）

租户工作台首页为地图 + 侧栏导航。菜单项打开的 UI 分 Collapsible、Dock 列、地图浮层、L4 右侧条带、Vaul Drawer 等类型，**不要混用两种 Drawer 实现**。

详见 [map-workspace-ui.md](./map-workspace-ui.md)。

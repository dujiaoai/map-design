# map-design 前端约束

在本 monorepo 中使用 `frontend-design` 时须遵守：

- UI 组件来自 **`@repo/ui`**（`packages/ui`），**实现功能时优先 shadcn 已有组件**；缺失则 `ui:add` 到 packages/ui，不另起 shadcn 实例、不手写替代 Button/Dialog/Input 等
- 样式：Tailwind CSS v4，全局样式见 `packages/ui/src/styles/globals.css`
- 语言：UI 固定中文，不含 i18n
- 设计系统：品牌主色 `--brand: #3094ff`（见 `packages/ui/src/styles/globals.css`），登录页与全站 `primary` / 侧栏一致
- 主题：默认深色，`ThemeProvider` + `html.dark`；新组件须支持浅色/深色 — Skill **`saas-theme-mode`**

## 开发

```bash
pnpm dev   # http://localhost:5175
```

## 相关 Skill

- `saas-fsd-feature` — FSD 分层与新增 feature
- `map-workspace-ui` — 地图工作台 UI 载体
- `map-plugin-integration` — 地图插件 bridge
- `repo-ui-package` — 组件库与 shadcn
- `saas-theme-mode` — 浅色/深色主题与语义 token

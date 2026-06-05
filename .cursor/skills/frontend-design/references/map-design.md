# map-design 前端约束

在本 monorepo 中使用 `frontend-design` 时须遵守：

- UI 组件来自 **`@repo/ui`**（`packages/ui`），不另起 shadcn 实例
- 样式：Tailwind CSS v4，全局样式见 `packages/ui/src/styles/globals.css`
- 语言：UI 固定中文，不含 i18n
- 设计系统：品牌主色 `--brand: #3094ff`（见 `packages/ui/src/styles/globals.css`），登录页与全站 `primary` / 侧栏一致

## 开发

```bash
pnpm dev   # http://localhost:5175
```

## 相关 Skill

- `saas-fsd-feature` — FSD 分层与新增 feature
- `map-workspace-ui` — 地图工作台 UI 载体

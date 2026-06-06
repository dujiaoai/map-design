---
name: saas-fsd-feature
description: >-
  Scaffold and modify FSD slices in @repo/saas-web monorepo apps/web. Use when
  adding features, entities, widgets, routes, shared modules, or packages in
  map-design. Covers dependency direction, public API exports, clientLoader
  guards, and pnpm workspace conventions.
---

# SaaS FSD Feature（map-design）

## Monorepo 边界

| 允许 | 禁止 |
| --- | --- |
| `packages/*` 共享逻辑 | import `@taiyi/*` 遗留业务包 |
| `@repo/ui` 组件 | App 反向依赖 packages |
| `workspace:*` 内部包 | 在 UI 包写业务 store |

详见 [docs/architecture/monorepo.md](../../docs/architecture/monorepo.md)。

## FSD 分层（apps/web）

```
app/
├── routes/          # 页面（非标准 pages/）
├── layouts/         # clientLoader 鉴权守卫
├── features/        # 用户场景
├── entities/        # 领域实体
├── widgets/         # 复合 UI
└── shared/          # auth、api、session、queries
```

依赖方向：**widgets → features → entities → shared**（低层不得引用高层）。

## 新增 Feature 工作流

```
- [ ] 1. 创建 app/features/<name>/{ui,model,lib}/ + index.ts 导出 Public API
- [ ] 2. UI：优先 @repo/ui shadcn 组件；缺项先在 packages/ui ui:add（Skill repo-ui-package）
- [ ] 3. 如需路由：在 app/routes.ts 注册 + layouts 守卫
- [ ] 4. 服务端数据：shared/queries/ 封装 TanStack Query
- [ ] 5. 鉴权：layouts/app-layout clientLoader 或 requireRole
- [ ] 6. 验证：pnpm --filter @repo/saas-web validate
```

## API 选用

| 场景 | 包 |
| --- | --- |
| 当前登录/菜单/用户 | `@repo/ruoyi-api` |
| Mock 本地开发 | `shared/mock/dev-auth.ts` |
| 目标 SaaS REST | `@repo/api-client`（规划） |

详见 [docs/architecture/backend-integration.md](../../docs/architecture/backend-integration.md)。

## 常用命令

```bash
pnpm dev                              # 根目录启动 saas-web（5175）
pnpm --filter @repo/saas-web validate # typecheck + lint + test
pnpm --filter @repo/saas check        # Biome 全仓
pnpm --filter @repo/ui ui:add dialog  # 添加 shadcn 组件
```

## 地图相关变更

| 场景 | Skill |
| --- | --- |
| 侧栏、Dock、浮层、快捷工具条 | `map-workspace-ui` |
| MapProvider / pluginToolId / bridge | `map-plugin-integration` |
| 登录、路由守卫、bootstrap | `saas-auth-ruoyi` |
| `@repo/ui` 组件 | `repo-ui-package` |
| 浅色/深色主题 | `saas-theme-mode` |

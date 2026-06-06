# SaaS 贡献规范

## 范围

在本仓库（`map-design`）内开发 SaaS 功能。若嵌入父 monorepo，对应 `saas/` 目录。

## 命令

```bash
pnpm --filter @repo/saas-web dev
pnpm --filter @repo/ui ui:add dialog
pnpm --filter @repo/cloud-uav dev
pnpm --filter @repo/saas check
```

完整本地开发指南：[runbooks/local-dev.md](./runbooks/local-dev.md)。

## 依赖边界

- 共享逻辑 → `packages/*`
- UI 组件 → `packages/ui`
- RuoYi API → `packages/ruoyi-api`（过渡阶段）
- SaaS REST → `packages/api-client`（目标阶段）
- **禁止** import 遗留 `apps/yunyan-*` 或 `@taiyi/*` 业务包（cloud 宿主集成除外）

## 新增 Feature

1. 在 `app/features/<name>/` 实现（FSD 分层）
2. **UI 优先 shadcn**：从 `@repo/ui` 组合；缺 primitive 时先在 `packages/ui` 执行 `ui:add`（见 [frontend.md](./architecture/frontend.md#ui-组件选型shadcn-优先)）
3. 在 `app/routes.ts` 注册路由
4. 配置 `clientLoader` 权限守卫
5. 经切片 `index.ts` 导出 Public API

## 地图工作台变更

修改侧栏、map-workspace store 或 UI 载体前，先读：

- [architecture/map-workspace-ui.md](./architecture/map-workspace-ui.md)
- [architecture/map-plugin-integration.md](./architecture/map-plugin-integration.md)

## PR

- Conventional Commits（生成建议：`node .cursor/skills/git-commit/scripts/generate-commit-message.mjs`；Skill：`/git-commit`）
- 架构变更需同步更新 `docs/architecture/` 或 `docs/adr/`

## 文档

总架构见 [architecture/README.md](./architecture/README.md)。

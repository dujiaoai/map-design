# SaaS 贡献规范

## 范围

仅在 `saas/` 内开发 SaaS 功能。

## 命令

```bash
pnpm --filter @haoxuan/saas-web dev
pnpm --filter @haoxuan/ui ui:add dialog
pnpm --filter @haoxuan/cloud-uav dev
```

## 依赖边界

- 共享逻辑 → `saas/packages/*`
- UI 组件 → `saas/packages/ui`
- **禁止** import 遗留 `apps/yunyan-*` 或 `@taiyi/*` 业务包（cloud 宿主集成除外）

## 新增 Feature

1. 在 `app/features/<name>/` 实现
2. 在 `app/routes.ts` 注册路由
3. 配置权限 meta / `clientLoader`

## PR

- Conventional Commits
- 更新相关 `saas/docs/` 若架构有变

## 文档

总架构见 [architecture/README.md](./architecture/README.md)。

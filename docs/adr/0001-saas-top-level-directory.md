# ADR-0001: 选用 saas/ 顶层目录

## Status

Accepted

## Context

SaaS 三 App 若放在 monorepo 根 `apps/web`、`apps/admin`，与 `yunyan-web`、`yunyan-admin` 冲突；共享 `packages/types`、`packages/ui` 亦与遗留包重名。

## Decision

在 monorepo 根下建立独立目录 `saas/`，内含 `apps/`、`packages/`、`cloud/`、`docs/`。`pnpm-workspace.yaml` 增加 `"saas/**"`。

## Consequences

- 与遗留栈物理隔离，App 内可用短目录名 `web`、`admin`
- UI 置于 `saas/packages/ui`（`@haoxuan/ui`），不复用 Vue `@taiyi/ui`
- 路径略长，Vite alias 需相对 `saas/` 计算

# ADR-0001: 选用 saas/ 顶层目录

## Status

Accepted

## Context

SaaS 三 App 若放在 monorepo 根 `apps/web`、`apps/admin`，与 `yunyan-web`、`yunyan-admin` 冲突；共享 `packages/types`、`packages/ui` 亦与遗留包重名。

## Decision

在 monorepo 根下建立独立目录 `saas/`，内含 `apps/`、`packages/`、`cloud/`、`docs/`。`pnpm-workspace.yaml` 增加 `"saas/**"`。

## Consequences

- 与遗留栈物理隔离，App 内可用短目录名 `web`、`admin`
- UI 置于 `saas/packages/ui`（`@repo/ui`），不复用 Vue `@taiyi/ui`
- 路径略长，Vite alias 需相对产品线根计算

## 补充（2026）

本仓库（`map-design`）已作为**独立 Git 仓库**维护，仓库根即产品线根（`apps/`、`packages/`、`cloud/` 直接在根下）。嵌入父 monorepo 时仍可使用 `saas/` 子目录布局，语义不变。

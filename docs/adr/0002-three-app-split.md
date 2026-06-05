# ADR-0002: Marketing / Web / Admin 三 App 拆分

## Status

Accepted

## Context

SaaS 需区分公开官网、租户工作台、平台运营后台，安全域与部署策略不同。

## Decision

三个独立 React Router 应用：

- `saas/apps/marketing` — `@haoxuan/saas-marketing`
- `saas/apps/web` — `@haoxuan/saas-web`
- `saas/apps/admin` — `@haoxuan/saas-admin`

## Consequences

- 独立构建与 CDN 部署
- Admin 可限制内网访问
- 共享 UI 与 packages，禁止跨 App import 路由模块

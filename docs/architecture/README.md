# SaaS 总架构

SaaS 产品线前端 monorepo，本仓库（`map-design`）根目录即产品线根，与遗留 `apps/yunyan-*`（Vue 栈）隔离。若嵌入父 monorepo，则置于 `saas/` 子目录（见 [ADR-0001](../adr/0001-saas-top-level-directory.md)）。

## 产品概览

| App | 域名 | 用户 | 职责 | 状态 |
| --- | --- | --- | --- | --- |
| Marketing | `www.example.com` | 访客 | 官网、定价、注册 | 占位 |
| Web | `app.example.com` | 租户用户 | 工作台、核心业务 | **活跃开发** |
| Admin | `admin.example.com` | 平台运营 | 租户、计费、审计 | 占位 |

## 系统上下文

```mermaid
flowchart LR
  User[租户用户] --> Web[apps/web]
  Visitor[访客] --> Marketing[apps/marketing]
  Operator[平台运营] --> Admin[apps/admin]
  Web --> SaaSAPI[SaaS_API_v1 — 主路径 C-06～C-08]
  Web -.-> RuoYi[RuoYi — 非会话遗留类型]
  Admin --> SaaSAPI
  Marketing --> SaaSAPI
  Web --> MapPlugins[map-plugins — 待接]
  YunyanWeb[yunyan-web 宿主] --> CloudUAV[cloud/uav]
```

## Monorepo 布局

见 [monorepo.md](./monorepo.md) 与 [../../README.md](../../README.md)。

## 多租户

默认：**共享 DB + Row-Level Security + `tenant_id`**（[ADR-0004](../adr/0004-tenant-isolation-strategy.md) Accepted）。前端 `@repo/auth` 已提供 `TenantProvider`；侧栏暂为 `mock-nav-items` 全量（**C-09 `filterNavByTenant` 暂缓**）。详见 [multi-tenancy.md](./multi-tenancy.md)；RLS 原理见 [tenant-rls-b05.md](./supplements/tenant-rls-b05.md)。

## 认证与授权

**当前**：登录/注册/bootstrap 已走 SaaS（C-06～C-08）；Account 部分仍 RuoYi。  
**路线图**：C-10～C-12 收尾 → Sprint D 权限与后台 → Sprint E 业务域（Later）。详见 [services-development-plan.md](./services-development-plan.md)（含 **§十 执行指引**）。

## API 双轨

| 阶段 | 客户端 | 用途 |
| --- | --- | --- |
| 主路径 | `@repo/api-client` | 登录、注册、bootstrap、`users/me` |
| 遗留 | `@repo/ruoyi-api` | 菜单类型等非会话引用（会话路径已清理 C-12） |

## 安全基线

- OWASP Top 10 对照
- CSP、CSRF（Cookie 模式时）
- 审计日志（Admin 操作、impersonation）
- PII 最小化采集

## 可观测性（规划）

- OpenTelemetry trace
- Sentry 错误（按 `tenantId` 分组）
- 结构化日志字段：`tenantId`、`userId`、`traceId`

## 环境

| 环境 | 用途 |
| --- | --- |
| development | 本地 dev |
| staging | 预发 / PR 预览 |
| production | 生产 |

## 部署

三 App 独立静态/CDN 部署 + API 网关。详见 [../runbooks/deployment.md](../runbooks/deployment.md)。

## 子文档

| 文档 | 说明 |
| --- | --- |
| [monorepo.md](./monorepo.md) | 工程结构、包依赖、workspace |
| [apps.md](./apps.md) | 三 App + Cloud UAV |
| [frontend.md](./frontend.md) | 前端规范、FSD |
| [packages.md](./packages.md) | 共享 packages API |
| [backend-integration.md](./backend-integration.md) | RuoYi / SaaS API 集成 |
| [services-development-plan.md](./services-development-plan.md) | `services/` 后端开发计划与迭代任务 |
| [map-workspace-ui.md](./map-workspace-ui.md) | 地图工作台 UI 载体 |
| [map-plugin-integration.md](./map-plugin-integration.md) | 地图插件桥接 |
| [map-plugins-catalog.md](./map-plugins-catalog.md) | 地图插件 Skill 能力目录（52 个） |
| [auth-rbac.md](./auth-rbac.md) | 认证权限 |
| [multi-tenancy.md](./multi-tenancy.md) | 多租户 |

## 实现状态

| 模块 | 状态 |
| --- | --- |
| saas-web FSD 骨架 + 地图工作台 UI | 已完成 |
| Sprint C：登录·注册·bootstrap（C-06～C-08） | ✅ 已完成 |
| Sprint C：侧栏 filterNavByTenant（C-09） | ⏸ 暂缓 |
| Sprint C：Account（C-10） | ✅ |
| Sprint C：TeamSwitcher（C-11） | ✅ |
| Sprint C：RuoYi 会话清理（C-12） | ✅ |
| Sprint D：权限模型（D-01） | ✅ |
| Sprint D：用户 permissions（D-02） | ✅ |
| Sprint D：权限配置 API（D-03） | ✅ |
| Sprint D：租户/用户 admin·部署（D-04～D-10） | 待实现 |
| Sprint E：地图/机库等业务 API | Later，C/D 不做 |
| packages（ui/auth/api-client/ruoyi-api） | 已完成 |
| SaaS `/v1` 后端 | Auth MVP + 租户 API ✅ |
| map-plugin-bridge 真实接入 | Sprint E 前可并行 UI |
| settings / :orgSlug 路由 | 规划中（feature 已有，路由未注册） |

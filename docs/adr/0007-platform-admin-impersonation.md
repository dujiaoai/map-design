# ADR-0007: Platform Admin 租户代操作（impersonation）

## Status

Accepted

## Context

`PLATFORM_ADMIN` 需对任意租户执行成员、计费、配置等运维操作。按 [0004-tenant-isolation-strategy.md](./0004-tenant-isolation-strategy.md)，JWT `tenant_id` 始终为登录时绑定的**主租户**；跨租户写操作不能依赖客户端 header 或绕过 RLS。

此前 Admin 跨租户 API 在 Service 层临时 `TenantContext.set(targetTenantId)`，审计通过 `crossTenant` 标记，但会话上下文与 RLS 不一致，且无法在前端统一展示「当前代操作租户」。

## Decision

### 1. JWT claim

| Claim | 含义 |
| --- | --- |
| `tenant_id` | 操作人登录主租户（不变） |
| `act_as_tenant` | 可选；代操作目标租户 UUID |

- access / refresh token **均携带** `act_as_tenant`（刷新时保留）。
- `TenantContext`、MyBatis 租户线、RLS `app.tenant_id` 使用 **effective tenant** = `act_as_tenant ?? tenant_id`。
- `SaasPrincipal.tenantId()` 仍为主租户，供审计 `actorTenantId`；新增 `actAsTenantId()` / `effectiveTenantId()`。

### 2. API

| 方法 | 路径 | 权限 | 行为 |
| --- | --- | --- | --- |
| POST | `/v1/admin/impersonation` | `admin:impersonate` + `PLATFORM_ADMIN` | body: `{ tenantId, reason }`；签发含 `act_as_tenant` 的新 token 对；写 `impersonation.start` 审计 |
| DELETE | `/v1/admin/impersonation` | 同上 | 清除 `act_as_tenant` 并重签 token；写 `impersonation.stop` 审计 |

禁止代操作自身主租户（`act_as_tenant == tenant_id` 返回 400）。

### 3. 会话 DTO

`GET /v1/users/me`（`SessionDto`）：

- `tenant`：effective 租户（代操作时为目标租户）。
- `homeTenant`：代操作时返回主租户，否则省略。

前端 `@repo/auth` `Session` 同步增加可选 `homeTenant`，Admin 展示代操作 banner。

### 4. 审计

- `impersonation.start` / `impersonation.stop`：`resource_type=tenant`，`crossTenant=true`，`detail` 含 `reason`。
- 代操作期间的其它 Admin 写操作仍走现有 `crossTenant` 逻辑（主租户 ≠ 目标租户）。

### 5. 明确不做（本期）

- 代操作为**整会话**切换，非 per-request header。
- 无 MFA 二次确认、无时长上限自动退出（FND-07 Later）。
- saas-web 工作台不暴露代操作入口（仅 Admin）。

## Consequences

### 正面

- RLS / TenantContext / 审计三者对齐；refresh 不丢失代操作态。
- Admin UI 可读取 `homeTenant` 展示「以 X 代操作 Y」并一键退出。

### 负面

- 代操作 token 与正常 token 权限相同，须严格 `admin:impersonate` 门控。
- 修改 `SaasPrincipal` / `SessionDto` 影响所有 `/users/me` 消费者（向后兼容：新字段可选）。

## References

- [multi-tenancy.md](../architecture/multi-tenancy.md)
- [platform-foundation-backlog.md](../architecture/supplements/platform-foundation-backlog.md) FND-07

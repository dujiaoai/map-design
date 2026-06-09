# ADR-0004: 租户隔离策略

## Status

Accepted

## Context

map-design SaaS 需支持多租户：同一邮箱可属于多个租户（TeamSwitcher）、业务数据按租户隔离、前端 `tenantFeature` 能力门控依赖租户上下文。

需在以下维度定稿，避免前后端与 `services/saas-api` 各自发明租户传递方式：

| 维度 | 备选 |
| --- | --- |
| 数据隔离 | 共享库 + `tenant_id` 列 / schema-per-tenant / DB-per-tenant |
| 请求上下文 | JWT claim / `X-Tenant-Id` header / 子域名 / 路径前缀 |
| 数据库强制 | 应用层过滤 / PostgreSQL RLS |

Sprint B 已落地 `GET /v1/tenants`、`GET /v1/tenants/{id}/features`；若 `tenant_id` 语义不定稿，后续 Profile、业务 API 与 RLS（B-05）无法一致演进。

## Decision

### 1. 数据模型：共享库 + `tenant_id` 列

- 默认所有租户业务表使用 **同一 PostgreSQL schema**，每行带 **`tenant_id UUID`** 外键指向 `sys_tenant.id`。
- **不**默认采用 schema-per-tenant 或 DB-per-tenant；仅 enterprise 大客户合同可另开 ADR。
- 数据库层 **RLS** 作为纵深防御，由 Sprint B-05 在 Flyway 中逐步启用；应用层过滤仍为必选项。

### 2. 请求上下文：JWT claim `tenant_id`（定稿）

**当前会话的权威租户标识仅来自已签发的 JWT**，不在 SaaS API 上接受客户端自定义的 `X-Tenant-Id` 或路径租户段覆盖 token。

| Claim | 类型 | 说明 |
| --- | --- | --- |
| `sub` | string (UUID) | 当前租户下的用户 ID（`sys_user.id`） |
| `tenant_id` | string (UUID) | **当前活跃租户**（`sys_tenant.id`） |
| `roles` | string[] | 角色码，如 `TENANT_ADMIN`、`PLATFORM_ADMIN` |
| `typ` | string | `access` 或 `refresh` |
| `iss` | string | 签发方，配置项 `saas.jwt.issuer` |
| `exp` / `iat` | number | 标准 JWT 时间戳 |

实现常量：`JwtService.CLAIM_TENANT_ID = "tenant_id"`（`services/saas-api`）。

**access token 与 refresh token 均携带相同 `tenant_id`**；刷新后仍绑定登录时选定的租户，直至用户重新登录选择其他租户。

### 3. 登录与租户选择

| 阶段 | 字段 | 格式 | 说明 |
| --- | --- | --- | --- |
| `POST /v1/auth/login` 请求体 | `tenantId` | **租户 slug**（如 `demo`） | 多租户下同邮箱必填；用于解析 `sys_tenant` |
| 登录响应 / `GET /v1/users/me` | `tenant.id` | **UUID 字符串** | 与 JWT `tenant_id` 一致 |
| JWT payload | `tenant_id` | **UUID 字符串** | 后续所有受保护接口的租户上下文 |

**切换租户 = 使用目标租户 slug 重新登录**，获取新 token 对；本期不提供「仅换 tenant claim」的 switch API。

### 4. 服务端租户上下文传播

```
Authorization: Bearer <access>
        ↓
JwtAuthFilter.parseAccessToken()
        ↓
TenantContext.set(tenant_id)     // ThreadLocal，请求结束 clear
SaasPrincipal.tenantId()         // SecurityContext
        ↓
MyBatis-Plus TenantLineHandler   // 对配置表白名单追加 WHERE tenant_id = ?
```

- `TenantContext` 在 `JwtAuthFilter` 的 `finally` 中 **必须** `clear()`，防止线程池串租户。
- 无 Bearer 或未认证请求：**不**设置 `TenantContext`；受保护路由由 Spring Security 返回 401。

### 5. 应用层查询规则

| 场景 | 规则 |
| --- | --- |
| 默认 CRUD | 依赖 `TenantContext` + 表 `tenant_id` 列；禁止从 query/body 信任客户端传入的租户 ID 作为隔离依据 |
| 跨租户成员查询 | Mapper 方法显式 `@InterceptorIgnore(tenantLine = "true")` + 业务校验（如按邮箱查多租户成员） |
| 读其他租户资源 | 须校验 principal 与该租户存在成员关系，或 `PLATFORM_ADMIN`；否则 403 |
| `PLATFORM_ADMIN` | 可见 `GET /v1/tenants` 全量列表；**JWT `tenant_id` 仍为登录时绑定的租户**，跨租户写操作须走未来 impersonation + 审计（本期未实现） |

当前 MyBatis 租户表白名单：`sys_user`（`SaasTenantLineHandler`）。新增带 `tenant_id` 的业务表须同步注册白名单或 RLS 策略。

### 6. 明确不采用（本期）

| 方案 | 原因 |
| --- | --- |
| `X-Tenant-Id` header | 与 JWT 双源易不一致；增加 CSRF/越权面 |
| 子域名 `{tenant}.app...` | 运维与 Cookie 域复杂；留作 enterprise |
| 路径 `/t/{tenant}/v1/...` | 与 `@repo/api-client` 固定 `/v1` 前缀冲突 |
| JWT `act_as_tenant` impersonation | 平台代操作需审计链路，排期在 `/v1/admin/**` 之后 |

## Consequences

### 正面

- 前后端与 OpenAPI 单一真相：`tenant_id` UUID 贯穿 JWT、`SaasPrincipal`、`SessionDto`
- `@repo/api-client` 仅需 `Authorization: Bearer`，无需额外租户 header
- TeamSwitcher：列表 API + 重新登录即可切换租户上下文
- RLS（B-05）可与同一 `tenant_id` 列对齐

### 负面

- 切换租户必须 re-login，短于「无刷新换租户」体验（可后续加专用 switch 端点，仍须签发新 JWT）
- 测试与 dev 须注意 `TenantContext` 泄漏（Filter 已处理生产路径）
- `PLATFORM_ADMIN` 跨租户操作在 impersonation 落地前能力受限

## 当前实现（2026-06-09）

| 组件 | 路径 |
| --- | --- |
| JWT 签发/解析 | `services/saas-api/.../security/JwtService.java` |
| Filter + Context | `JwtAuthFilter.java`、`TenantContext.java` |
| 应用层租户线 | `SaasTenantLineHandler.java` |
| 租户列表 / 能力 | `TenantsController`、`TenantService` |
| 跨租户成员查询 | `SysUserMapper.selectActiveByEmailAcrossTenants` |

PostgreSQL RLS：`sys_user` 已启用（`db/migration-postgresql/V5__rls.sql` + `TenantRlsDataSource`）；其余业务表随 Sprint 扩展。  
**可读性补充**：[tenant-rls-b05.md](../architecture/supplements/tenant-rls-b05.md)（B-05 作用、双层防护、Bypass 说明）。

## 参考

- [multi-tenancy.md](../architecture/multi-tenancy.md)
- [tenant-rls-b05.md](../architecture/supplements/tenant-rls-b05.md) — B-05 RLS 补充材料
- [services-development-plan.md](../architecture/services-development-plan.md) — Sprint B
- [auth-rbac.md](../architecture/auth-rbac.md)
- `JwtService.CLAIM_TENANT_ID` — `services/saas-api`

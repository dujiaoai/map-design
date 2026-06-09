# 多租户

## 默认策略

**共享数据库 + `tenant_id` 列 +（计划中的）PostgreSQL RLS。**

已定稿：[ADR-0004: 租户隔离策略](../adr/0004-tenant-isolation-strategy.md)（**Accepted**）。

## Tenant 标识（已定稿）

**权威来源：JWT access token 的 `tenant_id` claim（UUID 字符串）。**

| 阶段 | 字段 | 格式 |
| --- | --- | --- |
| 登录请求 `POST /v1/auth/login` | `tenantId` | 租户 **slug**（多租户必填） |
| JWT / `GET /v1/users/me` | `tenant_id` / `tenant.id` | 租户 **UUID** |

服务端在 `JwtAuthFilter` 中解析 token → `TenantContext` → `SaasPrincipal.tenantId()`。  
**不接受** `X-Tenant-Id` 等客户端 header 覆盖 JWT 租户。

切换租户：使用目标 slug **重新登录**，获取新 token。

### 预留（本期不用）

| 方案 | 说明 |
| --- | --- |
| 子域名 | `{tenant}.app.example.com` — enterprise |
| 路径 | `/t/{tenant}/...` — 与 `/v1` 前缀冲突 |
| Header | `X-Tenant-Id` — 已否决，见 ADR-0004 |

## 数据隔离

| 模式 | 适用 |
| --- | --- |
| 共享 schema + `tenant_id` + RLS | **默认**（RLS：B-05） |
| schema-per-tenant | 强隔离、运维成本高 |
| DB-per-tenant | enterprise 大客户 |

应用层：`SaasTenantLineHandler` 对 `sys_user` 等表白名单自动追加 `tenant_id` 条件。  
跨租户查询须 `@InterceptorIgnore(tenantLine = "true")` 并做成员/角色校验。

数据库层（PostgreSQL dev）：`sys_user` 已启用 **RLS**（`V5__rls.sql`）。连接借出前由 `TenantRlsDataSource` 设置：

| 会话变量 | 含义 |
| --- | --- |
| `app.tenant_id` | 当前 JWT 租户 UUID |
| `app.bypass_tenant_rls = on` | 受信服务端路径（登录、跨租户成员查询） |

测试 profile（H2）不加载 `migration-postgresql`，`saas.tenant-rls.enabled=false`。

## 能力门控

`GET /v1/tenants/{id}/features` 返回 `sys_tenant_feature.feature_code` 列表，对齐前端 `MockModuleMeta.tenantFeature`（如 `custom.highway-alert`）。

## 配额

Plan 维度限制：seat 数、API rate、storage（待业务 API 排期）。

## 跨租户（Platform Admin）

`PLATFORM_ADMIN` 可列出全部租户；**跨租户写操作**须 future **impersonation + 审计日志**（操作人、目标租户、时间、原因）。本期未实现 `act_as_tenant` claim。

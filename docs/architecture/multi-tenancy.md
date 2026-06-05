# 多租户

## 默认策略

**共享数据库 + Row-Level Security（RLS）+ `tenant_id` 列。**

## Tenant 标识（ADR 待定）

| 方案 | 说明 |
| --- | --- |
| JWT claim | Token 内 `tenant_id` |
| Header | `X-Tenant-Id` |
| 子域名 | `{tenant}.app.example.com` |
| 路径 | `/t/{tenant}/...` |

## 数据隔离备选

| 模式 | 适用 |
| --- | --- |
| RLS + 共享 schema | 默认推荐 |
| schema-per-tenant | 强隔离、运维成本高 |
| DB-per-tenant |  enterprise 大客户 |

## 配额

Plan 维度限制：seat 数、API rate、storage。

## 跨租户

Platform Admin **impersonation** 必须写审计日志（操作人、目标租户、时间、原因）。

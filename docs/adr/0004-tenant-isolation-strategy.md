# ADR-0004: 租户隔离策略

## Status

Proposed

## Context

多租户 SaaS 需在成本、隔离强度、运维复杂度间权衡。

## Decision

**默认采用共享 DB + PostgreSQL RLS + `tenant_id`。**

Tenant 标识优先 JWT claim；子域名方案留作 enterprise 扩展。

## Consequences

- 应用层查询必须带 tenant 上下文
- Platform Admin 跨租户操作需 impersonation + 审计
- schema-per-tenant 仅在大客户合同要求时启用

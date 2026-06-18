# ADR-0014：SCIM Directory Sync PoC

> 状态：Accepted · 2026-06  
> 关联：[ADR-0010 SCIM 暂缓](./0010-scim-directory-sync-deferred.md)、Phase 10-5

## 背景

ADR-0010 将 SCIM 2.0 目录同步列为 backlog。Phase 10 在 **不替代邀请流** 的前提下交付最小 PoC，验证 Bearer token 鉴权、路由隔离与 Admin 可观测性。

## 决策

**PoC 范围（Phase 10-5）**：

1. `scim_provisioning_token` 表（tenant_id、token_hash、enabled）  
2. `GET /scim/v2/Users` 返回空 `ListResponse`（200 + Bearer 校验）  
3. Admin `GET /v1/admin/tenants/{id}/scim-provisioning` 只读状态  
4. **不实现** POST/PATCH/DELETE Users、Groups、Schema 扩展

完整 Directory Sync（deprovision、group→role 映射）仍依赖 ADR-0010 所列前提（付费 blocker、成员生命周期）。

## 备选方案

| 方案 | 说明 |
| --- | --- |
| **WorkOS Directory Sync** | 仍列为 Phase 11 评估项 |
| **自建完整 SCIM** | PoC 后按租户需求迭代 |
| **CSV 批量** | 已有成员邀请路径，非实时 |

## 后果

- `/scim/v2/**` 使用独立 Bearer filter，不走 JWT 租户 session  
- 合规 Tab 展示 SCIM endpoint URL 与 token 是否已配置  
- E2E 覆盖 401/200  smoke

## 参考

- [RFC 7644 SCIM Protocol](https://datatracker.ietf.org/doc/html/rfc7644)  
- [ADR-0010](./0010-scim-directory-sync-deferred.md)

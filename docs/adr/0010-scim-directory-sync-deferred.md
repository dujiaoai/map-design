# ADR-0010：SCIM / Directory Sync 暂缓

> 状态：Accepted · 2026-06  
> 关联：[admin-platform-evolution.md](../product/admin-platform-evolution.md) Phase 6-6

## 背景

企业客户常要求 IdP 目录同步（SCIM 2.0）或 HRIS → 成员生命周期自动化。map-design 当前成员路径为 **邮箱邀请 + 租户角色**，平台 Admin 已具备租户 OIDC 配置骨架。

## 决策

**Phase 6 不实现 SCIM**；以 ADR 记录约束，待以下条件满足再开独立 Sprint：

1. 至少 2 个付费租户明确 SCIM 为签约 blocker  
2. 成员离职/转交（Phase 6+）与审计策略就绪  
3. 选定 IdP 集成模式：**WorkOS Directory Sync** vs 自建 SCIM endpoint

## 备选方案

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| **WorkOS / Clerk Organizations** | 上线快、合规文档全 | .vendor 绑定、成本 |
| **自建 `/scim/v2` on saas-api** | 数据主权、与 RLS 一致 | 工程量大、需 SCIM 合规测试 |
| **仅 CSV 批量导入** | 低成本过渡 | 非实时、无 deprovision |

## 后果

- 演进路线图 Phase 6-6 标记为 **调研/ADR** ✅，非交付项  
- Admin `/members` 继续以邀请 + 角色为主路径  
- 新租户 SSO 优先 **租户 OIDC 配置（6-1）**，目录同步单列 backlog

## 参考

- [RFC 7644 SCIM Protocol](https://datatracker.ietf.org/doc/html/rfc7644)  
- [WorkOS Directory Sync](https://workos.com/docs/directory-sync)

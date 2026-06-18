# ADR-0013：租户 SSO SAML 连接（暂缓）

> 状态：Accepted · 2026-06  
> 关联：[admin-platform-evolution.md](../product/admin-platform-evolution.md) Phase 10-2

## 背景

Phase 8–9 已交付租户 **OIDC/OAuth** 完整授权流（authorize/callback、Admin 配置、metadata 导入）。部分企业 IdP 仅提供 **SAML 2.0** SP 集成（如 legacy ADFS、部分政务云），需在 roadmap 上预留数据模型与 Admin 只读摘要，避免与 OIDC 表结构混用。

## 决策

**Phase 10 仅调研 + 表骨架**，不实现 SAML AuthnRequest/Assertion 解析：

1. 新增 `tenant_saml_config`（entity_id、sso_url、certificate_pem、enabled）  
2. Admin 合规 Tab 展示只读 SAML 摘要（对齐 OIDC 卡片）  
3. 完整 SP 流（ACS、签名验证、NameID 映射）列入 **Phase 11+**

## 备选方案

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| **Spring Security SAML2 SP** | 与 Boot 生态一致 | 配置复杂、需 IdP metadata 运维 |
| **WorkOS / Auth0 SAML** | 快速上线 | 供应商绑定 |
| **仅 OIDC 联邦** | 零额外协议 | 无法满足纯 SAML IdP |

## 后果

- V41 migration + `TenantSamlAdminService.getConfig` 只读 ✅  
- saas-web 登录入口 **不** 暴露 SAML 按钮直至 Phase 11  
- OIDC 与 SAML 配置 **分表**，避免 secret/cert 混存

## 参考

- [OASIS SAML 2.0](https://docs.oasis-open.org/security/saml/v2.0/)  
- [ADR-0011 租户 SSO OAuth 流](./0011-tenant-sso-oauth-flow.md)

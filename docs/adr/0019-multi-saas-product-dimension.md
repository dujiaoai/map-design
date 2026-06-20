# ADR-0019: 多 SaaS 产品线维度（Product Registry）

## Status

Accepted

## Context

`@repo/saas-admin` 当前服务 map-design 单平台下的多租户运营，数据模型仅有 `sys_tenant`，无「产品线 / 平台实例」维度。Feature catalog、Admin 侧栏、品牌文案均与地图工作台硬绑定。

若要在同一 monorepo 内扩展第二个 SaaS 产品（如机库、CRM），或对外提供 white-label 运营台，需要：

1. 租户归属哪条产品线
2. 每条产品线独立的 feature catalog 与 Admin 模块子集
3. 品牌与导航可按产品配置

## Decision

1. 引入 **`sys_product`** 注册表（code、name、status），首条 seed 为 `map-design`。
2. **`sys_tenant.primary_product_id`** 关联租户主产品；新建租户默认 `map-design`。
3. **`sys_product_feature`** 存储每产品可开通能力码；`TenantFeatureAdminService` 优先读 DB，回退 Java 常量。
4. Admin 前端增加 **产品上下文**（localStorage `saas-admin:product`），侧栏可选产品过滤导航与 feature catalog。
5. **Admin 导航** 先保留静态 TS registry，后续提供 `GET /v1/admin/navigation?product=` 与前端 fallback 并存。
6. **品牌** 通过 `VITE_ADMIN_*` 与 `shared/config/admin-brand.ts` 外置，不阻塞 product 维度。

不在本 ADR 范围：多 saas-api 实例部署、组织树、运行时 module federation。

## Consequences

**正面**

- 新产品接入：seed product + features + 可选 Admin 模块，无需 fork Shell
- 租户列表可按产品筛选；feature 校验按产品 catalog 子集
- 为 backend-driven navigation 与 white-label 铺路

**负面**

- 迁移需回填现有租户 `primary_product_id`
- `AdminListParams` / 租户 API 需逐步扩展 product 过滤
- 测试 seed 需同步 product 表

## 关联

- [admin-platform-evolution.md](../product/admin-platform-evolution.md) Phase 18
- [ADR-0004 租户隔离](./0004-tenant-isolation-strategy.md)

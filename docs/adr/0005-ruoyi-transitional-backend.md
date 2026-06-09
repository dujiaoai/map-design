# ADR-0005: RuoYi 过渡后端策略

## Status

Accepted

## Context

SaaS 产品线目标后端为统一 REST API（`/v1`、OAuth2/OIDC），但当前生产环境仍运行 RuoYi（若依）后端。Web 工作台需要尽快可用：登录、菜单、用户 profile 均依赖 RuoYi 接口。

若直接在 App 中散落 RuoYi 请求逻辑，将导致：

- 与未来 SaaS API 迁移高度耦合
- 响应 envelope 格式（`{ code, msg, data }`）污染通用 client
- 难以在 RuoYi 下线后批量替换

## Decision

1. 新建 `@repo/ruoyi-api` 包，**隔离**所有 RuoYi 协议细节（envelope 解析、Zod schema、错误码）
2. 保留 `@repo/api-client` 作为目标 SaaS REST 客户端，不在其中混入 RuoYi 逻辑
3. App 层通过 `shared/queries/` 封装 TanStack Query，UI 不直接 import client
4. `@repo/auth` 管理 Session/Token；**Sprint C 起**由 SaaS 登录写入 auth store，会话来自 `GET /v1/users/me`
5. saas-web 迁移完成后，`ruoyi-api` 对工作台 **deprecated**；包保留供其它遗留集成

### 分阶段下线（2026-06 更新）

| 阶段 | 范围 | 策略 |
| --- | --- | --- |
| Sprint A/B | Auth、租户 API 后端 | ✅ 已完成 |
| **Sprint C** | **身份与会话** | C-01～C-12 ✅：注册、登录、bootstrap、Account、TeamSwitcher、去 RuoYi 会话桥接；侧栏 **mock-nav 全量**（C-09 **暂缓**） |
| **Sprint D** | **权限与后台** | `sys_permission`、权限配置、`/v1/admin/*`、`apps/admin`；**不做业务域 API** |
| **Sprint E** | 业务域 | 地图、机库、专题等 — C/D 不设计 |
| Later | `/v1/menus`、OAuth2/OIDC | 服务端导航与 OIDC 另排期 |

## Consequences

### 正面

- RuoYi 与 SaaS API 边界清晰；Sprint C 后 saas-web 仅消费 SaaS 会话 API
- 响应校验集中，类型安全
- 迁移时只需替换 query 层与 bootstrap 逻辑

### 负面

- 短期内维护两套 client 包
- saas-web 会话路径已不再写 `ruoyi-profile-store`；`@repo/ruoyi-api` 仅余非会话类型引用
- 文档需区分「会话主路径（SaaS）」与「Account 遗留（RuoYi）」

## 参考

- [services-development-plan.md](../architecture/services-development-plan.md) — Sprint C/D/E、§十 执行指引
- [backend-integration.md](../architecture/backend-integration.md)
- [auth-rbac.md](../architecture/auth-rbac.md)
- [packages.md](../architecture/packages.md)

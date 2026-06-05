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
4. `@repo/auth` 管理 Session/Token，RuoYi 登录成功后写入 auth store；用户信息从 RuoYi profile 同步
5. 迁移完成后 deprecate `ruoyi-api`，切换 query 层到 `api-client`

## Consequences

### 正面

- RuoYi 与 SaaS API 边界清晰，可并行存在
- 响应校验集中，类型安全
- 迁移时只需替换 query 层与 bootstrap 逻辑

### 负面

- 短期内维护两套 client 包
- `@repo/auth` 的 `refresh()` 暂未接通（RuoYi token 刷新策略待确认）
- 文档需区分「当前实现」与「目标架构」

## 参考

- [backend-integration.md](../architecture/backend-integration.md)
- [packages.md](../architecture/packages.md)

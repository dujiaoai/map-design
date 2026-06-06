# map-design 产品上下文

供 Anthropic PM Plugin（本地化 `pm-*` Skill）与 `/saas-product` 编排使用。

## 产品形态

| App | 包 | 状态 | 用户 | 核心职责 |
| --- | --- | --- | --- | --- |
| Web | `@repo/saas-web` | **活跃** | 租户用户 | 地图工作台、核心业务 |
| Admin | `@repo/saas-admin` | 占位 | 平台运营 | 租户、计费、审计 |
| Marketing | `@repo/saas-marketing` | 占位 | 访客 | 官网、定价、注册 |
| Cloud UAV | `@repo/cloud-uav` | 插件宿主 | 嵌入 yunyan-web | ESM 远程模块 |

架构总览：[docs/architecture/README.md](../../../docs/architecture/README.md)  
三 App 细节：[docs/architecture/apps.md](../../../docs/architecture/apps.md)

## Web 工作台（规格常用术语）

| 概念 | 文档 / 代码 |
| --- | --- |
| 侧栏导航 | `entities/navigation`、`widgets/app-sidebar` |
| 菜单 kind | `map-tool` / `map-dock-module` / `map-module` / `route` |
| 快捷工具条 | `features/map-quick-toolbar` |
| 工作台状态 | `features/map-workspace`（Zustand） |
| UI 载体映射 | [map-workspace-ui.md](../../../docs/architecture/map-workspace-ui.md) |
| 地图插件 | [map-plugin-integration.md](../../../docs/architecture/map-plugin-integration.md) |
| 插件能力目录 | [map-plugins-catalog.md](../../../docs/architecture/map-plugins-catalog.md)（52 个 toolId） |

写 PRD 时：**先明确菜单 kind 与 presentation**（movable-panel / drawer / dock），避免把 Vaul 页脚 Drawer 与地图工具 Drawer 混为一谈。

## 认证与多租户

- 当前：RuoYi 登录 + `@repo/auth` Session  
- 目标：OAuth2/OIDC + SaaS `/v1` API  
- 多租户：`tenant_id` + 导航 mock 过滤  

见 [auth-rbac.md](../../../docs/architecture/auth-rbac.md)、[multi-tenancy.md](../../../docs/architecture/multi-tenancy.md)。

## 规格 → 工程 handoff

| 产物 | 建议路径 | 实现 Skill |
| --- | --- | --- |
| PRD / 用户故事 | `docs/product/YYYY-MM-slug.md` | `/pm-write-spec` |
| 路线图 | `docs/product/roadmap.md` 或 ADR | `/pm-roadmap-update` |
| 用户研究合成 | `docs/product/research/` | `/pm-synthesize-research` |
| 架构决策 | `docs/adr/` | ADR 模板 + `/pm-stakeholder-update` |
| UI 实现 | `apps/web/app/**` | `/saas-fsd-feature` + `/map-workspace-ui` |
| 共享组件 | `packages/ui` | `/repo-ui-package` |
| 主题 | 全局 `html.dark` | `/saas-theme-mode` |
| 测试 | Vitest | `/webapp-testing` |

PRD 的 **验收标准** 应可映射为：

- 路由 / feature 路径（FSD）  
- 菜单项 mock 或 catalog 变更  
- `pnpm --filter @repo/saas-web validate` 通过  

## 不在范围（写 Non-Goals 时参考）

- 遗留 `apps/yunyan-*` Vue 栈（与本 monorepo 隔离）  
- 后端 RuoYi 大改（除非 ADR 明确）  
- 重复造 shadcn 组件（须走 `packages/ui`）  
- i18n（当前未规划）

## 推荐工作流

```
/pm-product-brainstorming  →  /pm-write-spec  →  docs/product/
        ↓                              ↓
/pm-synthesize-research          /pm-roadmap-update
        ↓                              ↓
   定稿后：/saas-fsd-feature + /map-workspace-ui + /webapp-testing
```

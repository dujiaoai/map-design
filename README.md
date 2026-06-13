# SaaS 产品线

多租户 SaaS 前端 monorepo（`map-design`），与遗留 `apps/yunyan-*`、`packages/*`（Vue 栈）隔离。可独立运行，也可嵌入父 monorepo 的 `saas/` 子目录。

**详细架构文档**：[docs/architecture/README.md](docs/architecture/README.md)

## 产品形态

| App | 域名示例 | 用户 | 职责 | 状态 |
| --- | --- | --- | --- | --- |
| **Marketing** | `www.example.com` | 访客 | 官网、定价、注册、文档 | [占位](apps/marketing/README.md) |
| **Web** | `app.example.com` | 租户用户 | 登录后工作台、核心业务 | [活跃开发](apps/web/README.md) |
| **Admin** | `admin.example.com` | 平台运营 | 租户管理、计费、审计 | [占位](apps/admin/README.md) |

- UI 固定中文，**不含 i18n**
- 不考虑与遗留 Vue 项目的兼容迁移

---

## 当前目录结构

```
map-design/
├── apps/
│   ├── web/                 @repo/saas-web
│   ├── marketing/           待 scaffold
│   └── admin/               待 scaffold
├── packages/
│   ├── ui/                  @repo/ui
│   ├── auth/                @repo/auth
│   ├── api-client/          @repo/api-client
│   └── ruoyi-api/           @repo/ruoyi-api
├── cloud/
│   └── uav/                 @repo/cloud-uav
└── docs/
    ├── architecture/
    ├── adr/
    └── runbooks/
```

### 实现进度

| 项 | 状态 |
| --- | --- |
| Web FSD 骨架 + 地图工作台 UI | 已完成 |
| SaaS 登录/注册/bootstrap（C-06～C-08） | 已完成 |
| Account / 侧栏 filter（C-09～C-12） | C-09～C-12 ✅ |
| packages（ui/auth/api-client/ruoyi-api） | 已完成 |
| cloud-uav ESM 远程插件脚手架 | 已完成 |
| Biome lint/format | 已完成 |
| map-plugin-bridge 真实接入 | 待接 MapProvider |
| Marketing / Admin 脚手架 | 仅 README 占位 |
| settings / :orgSlug 路由 | feature 已有，路由未注册 |

---

## 快速开始

```bash
cp .env.example .env
pnpm install

# 租户 Web 工作台
pnpm dev

# 机库云插件（需与 yunyan-web 宿主联调）
pnpm dev:uav

# 全目录 Biome / 校验
pnpm check
pnpm format
pnpm validate   # typecheck + test + biome（Turbo）
```

| 服务 | 端口 |
| --- | --- |
| `@repo/saas-web` | 5175 |
| `@repo/cloud-uav` | 5174 |
| `yunyan-web` 宿主 | 5103 |

详见 [docs/runbooks/local-dev.md](docs/runbooks/local-dev.md)。

---

## npm Scope

| 包名 | 路径 |
| --- | --- |
| `@repo/ui` | `packages/ui` |
| `@repo/auth` | `packages/auth` |
| `@repo/api-client` | `packages/api-client` |
| `@repo/ruoyi-api` | `packages/ruoyi-api` |
| `@repo/saas-web` | `apps/web` |
| `@repo/saas-marketing` | `apps/marketing`（待建） |
| `@repo/saas-admin` | `apps/admin`（待建） |
| `@repo/cloud-uav` | `cloud/uav` |

---

## 文档索引

| 文档 | 说明 |
| --- | --- |
| [docs/architecture/README.md](docs/architecture/README.md) | 总架构 |
| [docs/architecture/monorepo.md](docs/architecture/monorepo.md) | Monorepo 工程结构 |
| [docs/architecture/apps.md](docs/architecture/apps.md) | 三 App + Cloud UAV |
| [docs/architecture/frontend.md](docs/architecture/frontend.md) | 前端规范 |
| [docs/architecture/packages.md](docs/architecture/packages.md) | 共享 packages |
| [docs/architecture/backend-integration.md](docs/architecture/backend-integration.md) | 后端集成 |
| [docs/architecture/map-workspace-ui.md](docs/architecture/map-workspace-ui.md) | 地图工作台 UI |
| [docs/architecture/map-plugin-integration.md](docs/architecture/map-plugin-integration.md) | 地图插件桥接 |
| [docs/architecture/auth-rbac.md](docs/architecture/auth-rbac.md) | 认证权限 |
| [docs/architecture/multi-tenancy.md](docs/architecture/multi-tenancy.md) | 多租户 |
| [docs/adr/](docs/adr/) | 架构决策记录 |
| [docs/runbooks/local-dev.md](docs/runbooks/local-dev.md) | 本地开发 |
| [docs/runbooks/turbo.md](docs/runbooks/turbo.md) | Turborepo 任务编排 |
| [docs/runbooks/deployment.md](docs/runbooks/deployment.md) | 部署 |
| [docs/runbooks/docker-deployment.md](docs/runbooks/docker-deployment.md) | Docker 部署 |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | 贡献规范 |
| [.cursor/skills/README.md](.cursor/skills/README.md) | Cursor Agent Skills |

---

## 目标 Monorepo 结构

```
map-design/
├── apps/marketing|web|admin
├── packages/ui|auth|api-client|ruoyi-api|config|types|utils
├── cloud/uav
└── docs/
```

完整说明见 [docs/architecture/monorepo.md](docs/architecture/monorepo.md)。

---

## 参考链接

- [React Router 文档](https://reactrouter.com/)
- [React Router CLI](https://reactrouter.com/api/other-api/dev)
- [SPA 模式](https://reactrouter.com/how-to/spa)

# SaaS 产品线

多租户 SaaS 前端 monorepo，采用**独立顶层 `saas/` 目录**，与遗留 `apps/yunyan-*`、`packages/*`（Vue 栈）树状隔离。

**详细架构文档**：[docs/architecture/README.md](docs/architecture/README.md)

## 产品形态

| App | 域名示例 | 用户 | 职责 | 状态 |
| --- | --- | --- | --- | --- |
| **Marketing** | `www.example.com` | 访客 | 官网、定价、注册、文档 | [占位](apps/marketing/README.md) |
| **Web** | `app.example.com` | 租户用户 | 登录后工作台、核心业务 | [脚手架](apps/web/README.md) |
| **Admin** | `admin.example.com` | 平台运营 | 租户管理、计费、审计 | [占位](apps/admin/README.md) |

- UI 固定中文，**不含 i18n**
- 不考虑与遗留 Vue 项目的兼容迁移

---

## 当前目录结构

```
saas/
├── apps/
│   ├── web/                 @repo/saas-web
│   ├── marketing/           待 scaffold
│   └── admin/               待 scaffold
├── packages/
│   ├── ui/                  @repo/ui
│   ├── auth/                @repo/auth
│   └── api-client/          @repo/api-client
├── cloud/
│   └── uav/                 @repo/cloud-uav
└── docs/
    ├── architecture/
    ├── adr/
    └── runbooks/
```

### 待办

| 项 | 状态 |
| --- | --- |
| Web FSD 骨架（layouts / auth / 404 / Query / Zod） | 已完成 |
| UI alias 指向 `saas/packages/ui` | 已完成 |
| `saas/docs/` 架构文档 | 已完成 |
| Marketing / Admin 脚手架 | 仅 README 占位 |
| `packages/auth`、`api-client` | 已完成 |
| Biome（`saas/` lint/format） | 已完成 |
| Web 路由骨架 settings / :orgSlug | 已完成 |
| features dashboard store + profile 表单 | 已完成 |

---

## 快速开始

```bash
pnpm install

# 租户 Web 工作台
pnpm --filter @repo/saas-web dev

# 机库云插件（需与 yunyan-web 宿主联调）
pnpm --filter @repo/cloud-uav dev

# SaaS 全目录 Biome
pnpm --filter @repo/saas check
pnpm --filter @repo/saas format

# 宿主 + 插件并行
pnpm run dev:yunyan-cloud-uav
```

| 服务 | 端口 |
| --- | --- |
| `@repo/saas-web` | 5175 |
| `@repo/cloud-uav` | 5174 |
| `yunyan-web` 宿主 | 5103 |

---

## npm Scope

| 包名 | 路径 |
| --- | --- |
| `@repo/ui` | `saas/packages/ui` |
| `@repo/auth` | `saas/packages/auth` |
| `@repo/api-client` | `saas/packages/api-client` |
| `@repo/saas-web` | `saas/apps/web` |
| `@repo/saas-marketing` | `saas/apps/marketing`（待建） |
| `@repo/saas-admin` | `saas/apps/admin`（待建） |
| `@repo/cloud-uav` | `saas/cloud/uav` |

Workspace：`pnpm-workspace.yaml` 含 `"saas/**"`。

---

## 文档索引

| 文档 | 说明 |
| --- | --- |
| [docs/architecture/README.md](docs/architecture/README.md) | 总架构 |
| [docs/architecture/apps.md](docs/architecture/apps.md) | 三 App + Cloud UAV |
| [docs/architecture/frontend.md](docs/architecture/frontend.md) | 前端规范 |
| [docs/architecture/auth-rbac.md](docs/architecture/auth-rbac.md) | 认证权限 |
| [docs/architecture/multi-tenancy.md](docs/architecture/multi-tenancy.md) | 多租户 |
| [docs/adr/](docs/adr/) | 架构决策记录 |
| [docs/runbooks/deployment.md](docs/runbooks/deployment.md) | 部署 |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | 贡献规范 |

---

## 目标 Monorepo 结构

```
saas/
├── apps/marketing|web|admin
├── packages/ui|auth|api-client|config|types|utils
├── cloud/uav
└── docs/
```

完整说明见 [docs/architecture/README.md](docs/architecture/README.md)。

---

## 参考链接

- [React Router 文档](https://reactrouter.com/)
- [React Router CLI](https://reactrouter.com/api/other-api/dev)
- [SPA 模式](https://reactrouter.com/how-to/spa)

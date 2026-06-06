# map-design 路径 → commit scope

| 路径前缀 | scope | 说明 |
| --- | --- | --- |
| `apps/web/` | `saas-web` | 默认 Web 应用 |
| `apps/web/app/features/map-workspace/` | `map-workspace` | 工作台状态与载体（可与 saas-web 二选一，优先更具体） |
| `packages/ui/` | `ui` | shadcn / 设计 token |
| `packages/auth/` | `auth` | Session / RBAC |
| `packages/ruoyi-api/` | `ruoyi-api` | RuoYi 客户端 |
| `packages/api-client/` | `api-client` | SaaS REST 客户端 |
| `cloud/uav/` | `cloud-uav` | ESM 远程模块 |
| `.cursor/skills/` | `skills` | Agent Skills |
| `.cursor/rules/` | `cursor` | Cursor Rules |
| `docs/adr/` | `adr` | 架构决策记录 |
| `docs/` | `docs` | 架构与 runbook |
| `packages/`（其他） | `packages` | 共享包 |
| 根目录配置 | `repo` | `biome.json`、`pnpm-workspace.yaml` 等 |

## 仓库 commit 风格样本

```
feat(saas-web): 指挥舱工作台与登录页体验升级
docs: Expand architecture docs and add standalone monorepo workspace setup.
chore: Rename monorepo package scope from @haoxuan to @repo
```

产品向改动可用**中文 subject**；工具/文档可用英文。保持 `type(scope): subject` 结构。

## 与架构文档联动

若变更涉及架构行为，同一 PR / commit 应同步：

- `docs/architecture/*.md`
- `docs/adr/`（重大决策）

commit body 可写：`Docs: sync map-workspace-ui.md`

# Turborepo 任务编排

本仓库使用 [Turborepo](https://turbo.build/) **2.9.16**（npm `latest`）在 pnpm workspace 上编排构建、类型检查与测试；Biome lint/format 仍在根目录 `@repo/saas` 执行。

## 与 pnpm 的分工

| 工具 | 职责 |
| --- | --- |
| **pnpm** | 依赖安装、`workspace:*` 链接、`catalog:` 版本；`dev` 直接走 filter |
| **Turbo** | 构建/类型检查/测试并行与缓存（经 `scripts/turbo-run.mjs`，失败时降级 pnpm） |
| **Biome** | 全仓 lint/format（根脚本 `pnpm check`） |

### Windows 前置条件

Turborepo 依赖原生 `turbo.exe`，需要 **Microsoft Visual C++ 2015–2022 Redistributable (x64)**：

https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist

若未安装，运行 `pnpm build` / `typecheck` 时会自动降级为 `pnpm -r run …` 并打印提示；**`pnpm dev` 不经过 Turbo**，可直接使用。

## 常用命令

在**仓库根目录**执行：

```bash
# 开发
pnpm dev              # saas-web（等同 dev:web）
pnpm dev:web:airace   # airace 模式
pnpm dev:uav          # cloud-uav 插件

# 构建（带缓存，依赖包先 build）
pnpm build            # 全部有 build 脚本的包
pnpm build:web
pnpm build:web:airace
pnpm build:uav

# 质量门禁
pnpm typecheck        # 全 workspace typecheck（先跑依赖包 ^typecheck）
pnpm test             # 全 workspace 单测
pnpm validate         # typecheck + test + biome check

# 仍可直接 filter（不经过 turbo 缓存编排）
pnpm --filter @repo/saas-web validate
```

## turbo.json 任务说明

| 任务 | 缓存 | 说明 |
| --- | --- | --- |
| `build` / `build:airace` | 是 | 产物 `build/**`、`dist/**`；`dependsOn: ["^build"]` |
| `typecheck` | 是 | `dependsOn: ["^typecheck"]`；saas-web 输出 `.react-router/**` |
| `test` | 是 | 各包 Vitest |
| `dev` / `dev:airace` / `preview` | 否 | `persistent: true`，长期运行 |

无对应 script 的包会被 Turbo **自动跳过**（如 `@repo/ui` 仅有 `ui:add`）。

## 包级脚本一览

| 包 | build | typecheck | test | dev |
| --- | --- | --- | --- | --- |
| `@repo/saas-web` | ✓ | ✓ | ✓ | ✓ |
| `@repo/cloud-uav` | ✓ | — | — | ✓ |
| `@repo/auth` | — | ✓ | ✓ | — |
| `@repo/api-client` | — | ✓ | ✓ | — |
| `@repo/ruoyi-api` | — | ✓ | ✓ | — |
| `@repo/ui` | — | — | — | — |

## 缓存目录

- 本地缓存：`.turbo/`（已加入 `.gitignore`）
- 清除缓存：`pnpm exec turbo run build --force`

## CI 建议

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm validate
- run: pnpm build
```

如需远程缓存，配置 [Turborepo Remote Cache](https://turbo.build/docs/core-concepts/remote-caching)（Vercel 或自托管）。

## 升级 Turbo

```bash
pnpm add -D turbo@latest -w
pnpm exec turbo --version
```

对照 [Turbo 发布说明](https://github.com/vercel/turborepo/releases) 检查 `turbo.json` 破坏性变更。

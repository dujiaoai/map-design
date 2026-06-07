# 本地开发 Runbook

## 前置条件

| 工具 | 版本 |
| --- | --- |
| Node.js | ≥ 20.19.0 |
| pnpm | ≥ 9.14.0 |
| Turbo | 2.9.16（根 devDependency，随 `pnpm install` 安装） |

## 安装

```bash
pnpm install
```

本仓库自带 `pnpm-workspace.yaml`，可独立安装。若嵌入父 monorepo 的 `saas/` 子目录，则在父仓根目录执行 `pnpm install`。

## 环境变量

复制示例文件并按需修改：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_APP_BASE_HOST` | `https://www.airace.com.cn` | RuoYi API 代理目标（vite proxy `/YunYanApi`） |

`.env` 文件放在**仓库根目录**。`apps/web/vite.config.ts` 通过 `loadEnv(mode, repoRoot, '')` 加载。

可选：使用 `--mode airace` 加载 `.env.airace`：

```bash
pnpm --filter @repo/saas-web dev:airace
```

## 启动服务

### 租户工作台（常用）

```bash
pnpm --filter @repo/saas-web dev
```

| 项 | 值 |
| --- | --- |
| 端口 | 5175 |
| 路由 | `/login`、`/`（地图工作台） |
| API 代理 | `http://localhost:5175/YunYanApi` → `VITE_APP_BASE_HOST` |

### 机库云插件

```bash
pnpm --filter @repo/cloud-uav dev
```

| 项 | 值 |
| --- | --- |
| 端口 | 5174 |
| Base | `/yunyan-cloud-uav/` |
| 独立预览 | `http://localhost:5174/yunyan-cloud-uav/` |

### 与 Vue 宿主联调

需同时启动 `yunyan-web`（父 monorepo，端口 5103）：

```bash
# 终端 1
pnpm --filter @repo/cloud-uav dev

# 终端 2（父 monorepo）
pnpm --filter @taiyi/yunyan-web dev:airace
```

宿主通过 proxy 将 `/yunyan-cloud-uav/*` 转发到 5174。详见 `cloud/uav/README.md`。

### Biome

```bash
pnpm --filter @repo/saas check        # lint
pnpm --filter @repo/saas check:fix    # lint + autofix
pnpm --filter @repo/saas format       # format
```

### 测试

```bash
pnpm test                 # 全 workspace 单测（Turbo）
pnpm validate             # typecheck + test + biome
pnpm --filter @repo/saas-web validate   # 仅 web 包
pnpm --filter @repo/saas-web test:watch # Vitest watch
```

任务编排详见 [turbo.md](./turbo.md)。

## 常见问题

### `catalog:` 依赖解析失败

确保仓库根存在 `pnpm-workspace.yaml` 且含 `catalog` 段。独立 clone 后直接在根目录 `pnpm install`。

### Git dubious ownership

```bash
git config --global --add safe.directory D:/path/to/map-design
```

### 登录 401 / 验证码失败

- 确认 `VITE_APP_BASE_HOST` 指向可访问的 RuoYi 后端
- 检查浏览器 Network 中 `/YunYanApi/captchaImage` 响应
- 密码经 RSA 加密（`jsencrypt`），需后端公钥匹配

### Cloud UAV 联调 CSS/JS 404

- 插件 `base`、宿主 proxy 前缀、import 路径须一致：`/yunyan-cloud-uav/`
- 宿主 dev 端口非 5103 时：

```bash
CLOUD_PLUGIN_UAV_DEV_ORIGIN=http://localhost:YOUR_PORT pnpm --filter @repo/cloud-uav dev
```

## 嵌入父 Monorepo

若本仓库内容位于父仓 `saas/` 目录：

1. 父仓 `pnpm-workspace.yaml` 含 `"saas/**"`
2. 在父仓根 `pnpm install`
3. env 文件可放在父仓根或 `saas/` 根（取决于 vite `loadEnv` 路径配置）

详见 [../architecture/monorepo.md](../architecture/monorepo.md)。

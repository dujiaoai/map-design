# map-design Vitest + RTL 测试

本仓库单元/集成测试用 **Vitest + jsdom**（非 Playwright）。E2E 见 Skill `webapp-testing`。

## 分工

| 层级 | 工具 | 适用 |
| --- | --- | --- |
| 纯函数、store、URL 解析 | Vitest | `*.test.ts` 同目录或 `app/**` |
| React 组件交互 | Vitest + `@testing-library/react` | `*.test.tsx`（按需） |
| 浏览器真实 UI、登录流 | Playwright | `webapp-testing` + `references/map-design.md` |

## 配置

| 包 | 配置 | include |
| --- | --- | --- |
| `@repo/saas-web` | `apps/web/vitest.config.ts` | `app/**/*.test.{ts,tsx}` |
| `@repo/auth` | `packages/auth/vitest.config.ts` | package 内 tests |
| `@repo/api-client` | `packages/api-client/vitest.config.ts` | package 内 tests |
| `@repo/ruoyi-api` | 经 package tsconfig / vitest | `src/**/*.test.ts` |

saas-web alias：`~` → `apps/web/app`。

## 命令

```bash
pnpm --filter @repo/saas-web test
pnpm --filter @repo/saas-web test:watch
pnpm --filter @repo/saas-web validate   # typecheck + lint + test

pnpm --filter @repo/auth test
pnpm --filter @repo/ruoyi-api test
pnpm --filter @repo/api-client test
```

## 现有测试模式（saas-web）

### Zustand store

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useMapWorkspaceStore } from './workspace-store'

beforeEach(() => {
  useMapWorkspaceStore.getState().clearAll()
})
```

参考：`features/map-workspace/model/workspace-store.test.ts`

### URL / 纯函数

- `features/map-workspace/lib/workspace-url.test.ts`
- `features/map-workspace/lib/resolve-workspace-context.test.ts`
- `features/workspace-surface-drag/lib/surface-drag-math.test.ts`
- `features/map-quick-toolbar/lib/quick-toolbar-prefs.test.ts`

### localStorage

在 `beforeEach` 用 `localStorage.clear()` 或 mock；prefs 测试见 `quick-toolbar-prefs.test.ts`。

### packages

- `@repo/ruoyi-api`：`menu-route.test.ts` 等 Zod schema 测试
- `@repo/auth`：`roles.test.ts`
- `@repo/api-client`：`client.test.ts`（refresh 重试）

## 新增测试 checklist

1. 文件名 `*.test.ts` 或 `*.test.tsx`，放在被测模块附近
2. store 测试：`clearAll()` / reset 于 `beforeEach`
3. 不启动 dev server；不混用 Playwright
4. 改 bridge/store/URL 行为 — 优先补 Vitest，E2E 仅覆盖关键用户路径
5. PR 前跑 `pnpm --filter @repo/saas-web validate`

## Mock 与鉴权

- 登录 bootstrap mock：`shared/mock/dev-auth.ts`（`MOCK_ACCESS_TOKEN`）
- 测 bootstrap 时可 mock `@repo/ruoyi-api` 或走 mock token 分支
- 不在 Vitest 里依赖真实 RuoYi 后端

## 禁止

- 用 Playwright 测纯函数或 Zustand 状态机
- 在 Vitest 里 `pnpm dev` 起服（除非极少数 integration，本仓库暂无）
- 跳过 `validate` 只跑单文件而不告知用户

# map-design 本地测试配置

本仓库 `@repo/saas-web` 开发服务器默认值：

| 项 | 值 |
| --- | --- |
| 启动命令 | `pnpm dev`（根目录）或 `pnpm --filter @repo/saas-web dev` |
| 端口 | **5175** |
| 登录页 | `http://localhost:5175/login` |
| 工作台 | `http://localhost:5175/` |

## with_server.py 示例

```bash
python scripts/with_server.py \
  --server "pnpm dev" \
  --port 5175 \
  -- python your_automation.py
```

## Mock 登录

当前登录页使用 mock 数据（`shared/mock/dev-auth.ts`），任意账号/密码/验证码即可进入工作台，无需 RuoYi 后端。

## 验证命令

```bash
pnpm --filter @repo/saas-web test
pnpm --filter @repo/saas-web validate
```

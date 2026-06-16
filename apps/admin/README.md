# saas-admin

平台运营后台（`@repo/saas-admin`），React Router 7 SPA。**P0～P3 第一期 MVP 已交付**。

| 项 | 值 |
| --- | --- |
| 包名 | `@repo/saas-admin` |
| 端口 dev | **5181** |
| API | `/v1/admin/*`（Vite 代理 → saas-api :8082） |
| 架构说明 | [docs/architecture/apps.md](../../docs/architecture/apps.md) |

**≠** `apps/yunyan-admin`（若依 Vue 后台）。

## 开发

根目录需配置 `.env`（与 saas-web 共用）：

```env
VITE_API_URL=/v1
VITE_SAAS_API_HOST=http://localhost:8082
```

```bash
pnpm install
pnpm --filter @repo/saas-admin dev
# 或根目录：pnpm dev:admin
```

浏览器打开 http://localhost:5181/login（需先执行 `scripts/seed-demo-dev.sql`）。

### 联调账号

| 角色 | 邮箱 | 密码 | 租户 slug | 默认首页 |
| --- | --- | --- | --- | --- |
| 平台运营 | `admin@demo.local` | `password` | `demo` | `/` 概览 |
| 纯平台运营 | `platform@demo.local` | `password` | `demo` | `/` 概览 |
| 租户管理员 | `tenantadmin@demo.local` | `password` | `demo` | `/members` |
| 普通成员 | `member@demo.local` | `password` | `demo` | 无 Admin 权限 → `/403` |

## 路由

| 路径 | 说明 | 权限 |
| --- | --- | --- |
| `/login` | SaaS 登录（邮箱密码 + OIDC IdP 按钮） | 公开 |
| `/auth/oidc/callback/:providerId` | OIDC 授权码回调 | 公开 |
| `/` | 运营概览（`GET /v1/admin/stats` + ping） | `admin:tenants:read` 等 |
| `/tenants` | 租户列表、创建、编辑；服务端分页/搜索 | `admin:tenants:read` |
| `/tenants/:tenantId` | 租户详情（`?tab=` 信息 / 成员 / 自定义角色 / 能力；快捷跳转用户与计费） | `admin:tenants:read` |
| `/users` | 用户列表、邀请、编辑；`?tenantId=` 筛选 | `admin:users:read` |
| `/members` | 成员管理；`?tenantId=`（平台可跨租户） | `admin:members:read` 或平台角色 |
| `/tenant-roles` | 租户自定义角色与权限配置 | `admin:members:read` 或平台角色 |
| `/roles` | 系统角色权限（平台级） | `admin:roles:read` |
| `/permissions` | 权限目录（模块/权限项 CRUD；Ant Tree） | `admin:roles:read`（写：`admin:roles:write`） |
| `/menus` | 工作台菜单配置（段/项显隐、排序、标题） | `admin:menus:read`（写：`admin:menus:write`） |
| `/account` | 账号资料与改密 | 已登录 |
| `/billing` | 计费运营（钱包、SKU、订单、调账、对账等 Tab） | `admin:billing:*` |
| `/audit-logs` | 审计日志列表（租户/动作/日期/跨租户筛选；CSV 导出） | `admin:audit:read` / `admin:audit:export` |
| `/system` | 平台配置只读摘要与健康条（`GET /v1/admin/system/flags`） | `admin:tenants:read` |
| `/403` | 无运营权限 | — |
| `*` | 404 友好页 | — |

## 已实现能力（P0～P3 + P4 运维 UX）

- **P0**：平台统计卡片、三列表客户端筛选、`TENANT_ADMIN` 落点 `/members`
- **P1**：租户详情、跨租户成员、`GET/PUT` 租户能力
- **P2**：租户/用户服务端分页、`/account`、侧栏 TeamSwitcher（remember-login）
- **P3**：列表/详情 Skeleton、全局 404、`pnpm validate`（Vitest）
- **P4 运维控制台 UX**：工业深色网格壳、Health 条（含 ping）、列表 stagger 入场、租户详情 URL Tab、快捷入口、403/404 统一错误页
- **P4+ 计费 Sheet**：发票开具/驳回、对公转账驳回改用 Sheet（替代 `window.prompt`）；审计页计费动作可跳转对应 Tab
- **P4+ 跨页导航**：`AdminTenantContextBanner`、计费/用户 URL 筛选条、审计→用户/计费/租户链接、租户列表计费快捷入口、RBAC 骨架加载、Shell 动态租户标题
- **P4++ 主流 UX 对齐**：列表错误态「重试」、筛选 toggle 芯片统一、搜索框 `aria-label` + 清除、动效尊重 `prefers-reduced-motion`
- **P4+++ 表单与计费**：`@repo/ui` Checkbox 统一勾选控件；计费 11 Tab + 系统页错误重试；概览 ping 失败可重试
- **P4++++ 深度错态与筛选**：MetricCard / RBAC / 租户详情 / 邀请链接错误重试；列表「无匹配」可清除筛选
- **P4+++++ 操作反馈与筛选闭环**：挂载 `Toaster`；审计/计费零结果清除筛选；RBAC 权限搜索清除
- **P4++++++ 键盘与 CRUD 反馈**：列表 `/` 聚焦搜索；RBAC/租户/用户保存 Toast；邀请链接 Skeleton
- **P4+++++++ 反馈与排序扩展**：成员/账号/权限/邀请 Toast 全覆盖；租户与成员表客户端列排序
- **P4++++++++ 列表排序与 a11y**：用户/审计日志列排序；表头 `aria-sort`；邀请链接复制 Toast
- **P4+++++++++ 计费与复制反馈**：SKU/优惠券/调账/对公入账 Toast；`AdminIdCell` 复制 Toast；概览刷新 Toast
- **P4++++++++++ 排序透明化**：`AdminTableSortHint` 标明当前页/已加载范围 + 清除排序；租户自定义角色 Toast
- **P4++++++++++++ 审计 P1/P2**：租户/用户/计费写操作落库；动作枚举同步；资源列；`tenantId`/`from`/`to` 筛选；详情 Sheet
- **P4+++++++++++++ 审计 P3**：独立 `admin:audit:read` / `admin:audit:export`；CSV 导出（最多 5000 条）；`audit.export` 自审计；**不再**以 `admin:tenants:read` 代替审计权限（需重新登录刷新 JWT）
- **P4++++++++++++++ 审计完善**：`actorUserId` 筛选；DTO/CSV 含操作人 ID；租户详情快捷跳转审计
- **FND-07 代操作**：`admin:impersonate`；租户详情「代操作」Sheet；全局 banner 退出；用户行审计快捷链接
- **FND-07b MFA 骨架**：系统页展示 MFA 强制开关与当前账号 TOTP 状态
- **FND-07c MFA TOTP**：系统页绑定/注销 TOTP；登录 MFA 6 位码 step-up
- **FND-07d 代操作 MFA**：已绑定 TOTP 时代操作 Sheet 须输入 6 位动态码
- **FND-07e 恢复码**：绑定/重新生成后一次性展示；登录与注销可消费
- **FND-07f OIDC 骨架**：系统页/登录页展示 IdP 配置阶段
- **FND-07g OIDC 授权码（Admin）**：登录页 IdP 按钮；`/auth/oidc/callback/:providerId`；MFA step-up 与密码登录一致
- **FND-07k OIDC 解绑**：账号 Drawer「企业 IdP 登录绑定」列表与解除绑定

## 主流运维控制台 UX 对照

与 AWS Console / Vercel / Stripe Dashboard 等常见模式对齐的检查项（持续维护）：

| 维度 | 主流期望 | Admin 现状 |
| --- | --- | --- |
| **信息架构** | 侧栏分组 + 面包屑/页眉 eyebrow | ✅ 分组导航；计费页二级 Tab（概览/商品/资金/运营） |
| **列表页** | 搜索 + 筛选 + 分页 + 总数 | ✅ `AdminTableToolbar` + 服务端分页 |
| **加载态** | Skeleton，非空白闪烁 | ✅ `AdminTableSkeleton` / `AdminSidebarListSkeleton` |
| **空态/错态** | 明确文案 + 可恢复操作 | ✅ 列表/计费/RBAC/概览 MetricCard 均支持重试 |
| **筛选零结果** | 「清除筛选」恢复默认 | ✅ 租户/用户/成员/审计/计费 SKU·钱包·订单 |
| **操作反馈** | Toast 确认成功操作 | ✅ 全平台 CRUD、计费 11 Tab、复制、概览刷新 |
| **键盘效率** | 快捷键聚焦搜索 | ✅ 四主列表 + RBAC 权限树搜索 `/` + kbd 提示 |
| **表格列排序** | 可点击表头排序 | ✅ 四主表（租户/用户/成员/审计）服务端排序 |
| **筛选控件** | 一致的 chip/toggle，非原生 checkbox | ✅ 审计：动作/租户/日期/仅计费/成员/跨租户 |
| **危险操作** | Confirm / Sheet，非 `prompt` | ✅ 计费驳回 Sheet、`AlertDialog` |
| **跨页上下文** | 租户/筛选 banner + 清除 | ✅ `AdminTenantContextBanner` 等 |
| **无障碍** | 搜索 `role=searchbox`、`aria-label` | ✅ 工具栏搜索；排序表头 `aria-sort`；reduced-motion 已处理 |
| **批量操作** | 多选 + 危险操作确认 | ✅ 租户批量停用、用户批量禁用 |
| **列配置** | 用户自定义可见列 | ✅ 四主表 + 计费九 Tab 全部列表 localStorage 持久化 |
| **虚拟滚动** | 大列表流畅滚动 | ✅ 四主表 + 计费九 Tab antd virtual；菜单项固定高度滚动 |
| **RBAC 穿梭框** | 批量勾选权限 | ✅ 角色权限编辑 ≥12 项可切换 antd Transfer |

## 分级改进路线图

P0–P2（Ant 策略、服务端排序、计费 IA、批量操作）与 Later（Playwright、entities 拆分、菜单拖拽、列配置、虚拟滚动、RBAC Transfer、typecheck 修复）**均已完成**。`pnpm --filter @repo/saas-admin validate` 可通过。

后续产品 backlog 见下方「Later（P4 余项）」。技术延续：`entities/` 已拆 tenant / user / audit-log / member / permission / role / invite-link / tenant-role；`admin-api` 余下 ping/stats/system/MFA/OIDC/impersonation 可按需迁移。

## 验证

```bash
pnpm --filter @repo/saas-admin validate
pnpm --filter @repo/saas-admin test:e2e   # Playwright 登录页与路由守卫冒烟（需本机可启动 dev :5181）
cd services/saas-api && mvn test -Dtest=Admin*ControllerTest
```

### Docker 全栈联调

```bash
node .cursor/skills/docker-deploy/scripts/deploy.mjs up
node .cursor/skills/docker-deploy/scripts/deploy.mjs smoke
```

- Admin：http://localhost:8083/login（`admin@demo.local` / `password` / `demo`）
- 若本机 `mvn spring-boot:run` 占用 8082，在 `deploy/.env` 设置 `SAAS_API_PORT=18082`

## Later（P4 余项）

邮箱邀请。

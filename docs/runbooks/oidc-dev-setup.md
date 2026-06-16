# OIDC 本地联调 SOP

> 对应 ADR [0009-oauth2-oidc-login.md](../adr/0009-oauth2-oidc-login.md) Phase 2 · FND-07i  
> 默认 dev 栈仍走 Email/Password；本 SOP 仅在需要验证 IdP 集成时使用。

## 1. 目标与范围

| 项 | 说明 |
| --- | --- |
| 流程 | OAuth 2.0 Authorization Code + **PKCE (S256)** |
| 客户端 | saas-web（`:5175`）与 Admin（`:5181`）登录页 IdP 按钮 |
| 用户映射 | OIDC `email` 须与已有 `sys_user.email` 一致（同租户 slug） |
| 不含 | 显式 OAuth bind 表、生产 IdP 运维 |

---

## 2. 前置条件

- [ ] PostgreSQL + Redis 已启动（`services/docker-compose.dev.yml`）
- [ ] `saas-api` dev profile（`:8082`），种子用户已导入（`seed-demo-dev.sql`）
- [ ] 前端 `VITE_API_URL=/v1` 且 Vite 代理到 `:8082`
- [ ] Keycloak（或其它 OIDC Issuer）可访问

---

## 3. 环境变量（saas-api）

与 [application-oidc.example.yml](../../services/saas-api/src/main/resources/application-oidc.example.yml) 及根目录 [.env.example](../../.env.example) 对齐。**勿提交 client-secret。**

| 变量 | 默认 / 示例 | 说明 |
| --- | --- | --- |
| `SAAS_OAUTH2_ENABLED` | `false` | 全局开关 |
| `SAAS_WEB_BASE_URL` | `http://localhost:5175` | web 回调前缀 |
| `SAAS_ADMIN_BASE_URL` | `http://localhost:5181` | admin 回调前缀 |
| `SAAS_OAUTH2_KEYCLOAK_ISSUER_URI` | `http://localhost:8180/realms/yunyan` | OIDC Issuer |
| `SAAS_OAUTH2_KEYCLOAK_CLIENT_ID` | `saas-local` | 公开 client id |
| `SAAS_OAUTH2_KEYCLOAK_CLIENT_SECRET` | — | **必填** 后 `authorizationCodeFlowAvailable=true` |

Docker 全栈时使用网关端口，例如：

```bash
SAAS_WEB_BASE_URL=http://localhost:8084
SAAS_ADMIN_BASE_URL=http://localhost:8083
```

---

## 4. Keycloak 快速启动（推荐本地 IdP）

```bash
docker run -d --name keycloak-dev -p 8180:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.0 start-dev
```

管理台：http://localhost:8180/admin

### 4.1 Realm 与 Client

1. 新建 Realm：`yunyan`
2. 新建 Client：
   - Client ID：`saas-local`（与 `SAAS_OAUTH2_KEYCLOAK_CLIENT_ID` 一致）
   - Client authentication：**On**（confidential）
   - Standard flow：**On**
   - 复制 Client secret 到 `SAAS_OAUTH2_KEYCLOAK_CLIENT_SECRET`
3. **Valid redirect URIs**（provider id 为 `keycloak` 时）：

   ```
   http://localhost:5175/auth/oidc/callback/keycloak
   http://localhost:5181/auth/oidc/callback/keycloak
   ```

   Docker 栈替换为 `8084` / `8083` 端口。

4. （可选）Client → Advanced → Proof Key for Code Exchange：**S256**

### 4.2 测试用户

在 Keycloak 创建用户，Email 与 SaaS 种子一致，例如 `admin@demo.local`，并设置密码。

> OIDC 登录时仍须在登录页填写租户 slug（如 `demo`），后端按 email + tenant 映射 `sys_user`。

---

## 5. 启动 saas-api

**方式 A — dev profile + 环境变量（推荐）**

```bash
export SAAS_OAUTH2_ENABLED=true
export SAAS_OAUTH2_KEYCLOAK_CLIENT_SECRET=<from-keycloak>

mvn -f services/pom.xml -pl saas-api spring-boot:run -Dspring-boot.run.profiles=dev
```

**方式 B — 可选 oidc profile**

```bash
cp services/saas-api/src/main/resources/application-oidc.example.yml \
   services/saas-api/src/main/resources/application-oidc.yml
# 编辑 application-oidc.yml 填入 secret（该文件已 gitignore）

mvn -f services/pom.xml -pl saas-api spring-boot:run \
  -Dspring-boot.run.profiles=dev,oidc
```

---

## 6. API 探活

```bash
# 未配置 secret 时 enabled=false
curl -s http://localhost:8082/v1/auth/oidc/providers | jq

# 配置完成后应看到 authorizationCodeFlowAvailable: true
curl -s http://localhost:8082/v1/admin/system/flags | jq .oidc

# 获取 authorize URL（不在浏览器打开 state 会过期）
curl -s "http://localhost:8082/v1/auth/oidc/keycloak/authorize?client=web&tenantId=demo" | jq
```

---

## 7. 端到端手动验收

1. 启动 `pnpm --filter @repo/saas-web dev` 与（可选）`pnpm --filter @repo/saas-admin dev`
2. 打开 http://localhost:5175/login ，填写租户 `demo`
3. 点击「使用 Keycloak (local) 登录」→ 跳转 IdP → 授权
4. 回调 `/auth/oidc/callback/keycloak` 后进入工作台 `/`
5. Admin 重复：http://localhost:5181/login ，回调后进入运营概览

**平台管理员 MFA**：若账号已绑 TOTP，OIDC 回调后会进入 MFA step-up（与密码登录相同）。

---

## 8. 故障排查

| 现象 | 可能原因 |
| --- | --- |
| 登录页无 IdP 按钮 | `SAAS_OAUTH2_ENABLED=false` 或 client-secret 未配 |
| `redirect_uri mismatch` | Keycloak Valid redirect URIs 与 `SAAS_*_BASE_URL` 不一致 |
| `OIDC state expired` | authorize 与 callback 间隔 > 10 分钟，或 Redis 未连 |
| `用户不存在` / 401 | IdP email 与 `sys_user` 不匹配，或 tenant slug 错误 |
| Docker 回调 404 | `SAAS_WEB_BASE_URL` 仍指向 5175 而非 8084 |

---

## 9. 参考

- [0009-oauth2-oidc-login.md](../adr/0009-oauth2-oidc-login.md)
- [platform-foundation-backlog.md](../architecture/supplements/platform-foundation-backlog.md) FND-07i
- `OidcAuthService` 回调 URI 规则：`{base}/auth/oidc/callback/{providerId}`

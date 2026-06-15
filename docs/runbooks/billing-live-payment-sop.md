# Billing 在线支付 live 联调 SOP

> 对应 [billing-credits-prd.md](../product/billing-credits-prd.md) F-2.5  
> 本地 stub/mock 冒烟见 [billing-api-smoke.md](./billing-api-smoke.md)

## 1. 目标与范围

| 模式 | 用途 |
| --- | --- |
| `stub`（默认） | 开发/CI：占位 `payUrl`，不调用微信/支付宝 |
| `live` | 预发/生产：官方 SDK 下单 + Webhook 入账 + 可选查单补偿 |
| `mock` 网关 | `BILLING_MOCK_PAYMENT=true` 时仍可用 `mock-pay` 完成沙箱入账（与 `provider-mode` 独立） |

本 SOP 覆盖 **live 凭证配置 → 下单 → 回调 → JSAPI OAuth → 运维** 的检查顺序；不含商户进件与合同流程。

---

## 2. 前置条件

- [ ] `saas-api`（`:8082`）与 `billing-api`（`:8083`）已启动，JWT secret 一致
- [ ] 用户具备 `billing:recharge:create`；Admin 具备 `admin:billing:*`（退款/调账按需）
- [ ] 公网或内网穿透可达 **Webhook URL** 与 **OAuth 回调页**（`/billing`）
- [ ] 微信：商户号、API 证书、`app-id`（公众号/小程序与 JSAPI 一致）
- [ ] 支付宝：开放平台应用、RSA2 密钥对

---

## 3. 环境变量（billing-api）

与 [deploy/.env.docker.example](../../deploy/.env.docker.example) 对齐，**勿提交真实密钥**。

### 3.1 模式开关

```bash
BILLING_MOCK_PAYMENT=false
BILLING_PAYMENT_PROVIDER_MODE=live
# 回调丢失补偿（可选）
BILLING_PAYMENT_QUERY_SCAN_ENABLED=true
```

### 3.2 微信支付

| 变量 | 说明 |
| --- | --- |
| `BILLING_PAYMENT_WECHAT_APP_ID` | 公众号/小程序 AppID |
| `BILLING_PAYMENT_WECHAT_APP_SECRET` | 公众号密钥（**JSAPI OAuth** `snsapi_base`） |
| `BILLING_PAYMENT_WECHAT_MCH_ID` | 商户号 |
| `BILLING_PAYMENT_WECHAT_API_V3_KEY` | APIv3 密钥（32 字节） |
| `BILLING_PAYMENT_WECHAT_MERCHANT_SERIAL_NO` | 商户 API 证书序列号 |
| `BILLING_PAYMENT_WECHAT_PRIVATE_KEY_PEM` | `apiclient_key.pem` 内容（`\n` 或单行） |
| `BILLING_PAYMENT_WECHAT_NOTIFY_URL` | 例：`https://<host>/v1/billing/webhooks/wechat` |

### 3.3 支付宝

| 变量 | 说明 |
| --- | --- |
| `BILLING_PAYMENT_ALIPAY_APP_ID` | 开放平台 AppID |
| `BILLING_PAYMENT_ALIPAY_PRIVATE_KEY_PEM` | 应用私钥 |
| `BILLING_PAYMENT_ALIPAY_PUBLIC_KEY_PEM` | 支付宝公钥 |
| `BILLING_PAYMENT_ALIPAY_NOTIFY_URL` | 例：`https://<host>/v1/billing/webhooks/alipay` |
| `BILLING_PAYMENT_ALIPAY_GATEWAY_URL` | 生产默认；沙箱用支付宝文档网关 |

### 3.4 Webhook 验签（生产建议开启）

```bash
BILLING_WEBHOOK_SIGNATURE_VERIFY_ENABLED=true
BILLING_WEBHOOK_WECHAT_SIGNATURE_MODE=wechat_v3
BILLING_WEBHOOK_ALIPAY_SIGNATURE_MODE=alipay_rsa
# 平台公钥 PEM（验回调用，非商户私钥）
BILLING_WEBHOOK_WECHAT_PLATFORM_PUBLIC_KEY_PEM=...
BILLING_WEBHOOK_ALIPAY_PUBLIC_KEY_PEM=...
```

---

## 4. 联调步骤

### 4.1 API 探活（无需 live 凭证）

```bash
pnpm smoke:billing-api
```

脚本含 `wechat-oauth-config`：验证 `GET /v1/billing/wechat/oauth/config` 返回 `{ appId, enabled }`（dev 下 `enabled` 可为 `false`）。

### 4.2 Native / H5（微信）

1. saas-web 登录 → `/billing` → 渠道 **微信** → 场景 **Native** 或 **H5**
2. 创建订单；stub 下为占位 URL，live 下为 `code_url` / `h5_url`
3. 完成支付后：
   - 优先：**Webhook** 入账
   - 备选：开启 `query-scan-enabled`，`PendingPaymentQueryJob` 查单
   - 前端：**每 3s 轮询**订单直至 `paid`

### 4.3 JSAPI（微信内置浏览器）

1. **公众号**：设置 → 功能设置 → **网页授权域名** = 托管 saas-web 的域名（不含 `https://`）
2. 配置 `APP_ID` + `APP_SECRET` 后，`GET /wechat/oauth/config` 的 `enabled=true`
3. 微信内打开 `https://<host>/billing` → 渠道微信 → 场景 **JSAPI**
4. 首次下单触发 **snsapi_base** 授权 → 回流换 `openId` → 自动恢复 pending 充值 → **WeixinJSBridge** 调起支付
5. live 下单请求体需带 `wechatOpenId`（前端 OAuth 后自动填充）

### 4.4 支付宝 WAP

1. 渠道 **支付宝** → 场景 **WAP**
2. live 返回 GET 跳转 URL；用户浏览器打开完成支付
3. 异步通知至 `BILLING_PAYMENT_ALIPAY_NOTIFY_URL`

### 4.5 Webhook 手工验证（staging）

与 [billing-api-smoke.md](./billing-api-smoke.md) 相同，可设 `SMOKE_RECHARGE_CHANNEL=wechat|alipay` + 验签 env 走 webhook 入账路径。

---

## 5. 证书与密钥运维

| 项 | 建议 |
| --- | --- |
| 微信 API 证书 | 商户平台下载；序列号变更时更新 `MERCHANT_SERIAL_NO` + 私钥 |
| 微信 APIv3 密钥 | 泄露即轮换；轮换后重启 billing-api |
| 支付宝密钥 | 开放平台重置后同步 `PRIVATE_KEY` / 公钥 |
| OAuth app-secret | 与支付密钥分开保管；仅 billing-api 服务端使用 |
| 平台公钥（Webhook） | 与下单私钥分离配置，用于验签回调 |

轮换流程：**新密钥写入 secret 管理 → 滚动重启 billing-api → 沙箱单笔充值验证 → 观察 webhook/查单日志**。

---

## 6.5 Platform Admin 充值退款（live）

`POST /v1/admin/billing/recharge-orders/{orderNo}/refund`（`admin:billing:refund`）在 **stub/mock** 与 **live** 模式下均走 `PaymentGateway.refund`：

| 模式 | 行为 |
| --- | --- |
| `provider-mode=stub` | 同步占位退款号（`wx-refund-*` / `alipay-refund-*`），不调用网关 |
| `provider-mode=live` | 微信 V3 `RefundService.create` / 支付宝 `alipay.trade.refund` |
| `channel=mock` | 沿用 `MockPaymentGateway` 同步退款 |

**live 退款验收：**

1. 使用 live 模式完成一笔小额充值（§4）
2. Admin「充值订单」对该 `orderNo` 发起退款并填写原因
3. 订单状态 `paid` → `refunded`；钱包积分扣回；流水 `refund`
4. 商户平台侧可查到对应退款单（微信/支付宝控制台）

**注意：** 当前仅支持**同步**退款结果；网关返回 async 时将 409（与 Admin 退款服务一致）。

---

## 6. 故障排查

| 现象 | 排查 |
| --- | --- |
| live 下单 400「requires … credentials」 | 对照 §3 缺省 env |
| JSAPI 400「wechatOpenId is required」 | OAuth 未启用或未在微信内完成授权 |
| OAuth `enabled=false` | 缺 `APP_ID` 或 `APP_SECRET` |
| OAuth 40029 invalid code | code 一次性/过期；勿刷新重复使用 |
| 已支付未入账 | Webhook 是否 200；验签是否失败；开查单 Job |
| 502 Bad Gateway（SDK） | 商户号/AppID 不匹配；金额单位（分）；notify-url 未配 |

日志关键字：`Pending payment query failed`、`WeChat Pay`、`Alipay`。

---

## 7. 验收清单

- [ ] `pnpm smoke:billing-api` 通过（含 `wechat-oauth-config`）
- [ ] live Native 或 H5 单笔充值入账 + 流水 `recharge`
- [ ] （JSAPI）微信内 OAuth + 调起 + 入账
- [ ] Webhook 验签开启后回调仍成功
- [ ] （可选）查单 Job 在关闭 Webhook 时补单成功
- [ ] live 模式下 Admin 退款原路成功（§6.5）

## 参考

- [billing-service.md](../architecture/billing-service.md)
- [billing-credits-prd.md](../product/billing-credits-prd.md) §2.3–2.4、F-2.5
- [billing-api-smoke.md](./billing-api-smoke.md)

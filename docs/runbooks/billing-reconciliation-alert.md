# 计费日对账告警 Runbook

> 对应 billing-api `ReconciliationDailyAlertJob` 与 Admin 计费概览对账横幅。

## 触发条件

每日 **UTC 02:00**（可配置 `billing.reconciliation.alert-cron`）Job 对 **UTC 昨日** 运行日对账：

- 充值已付订单笔数/积分 vs 充值流水
- 退款订单笔数/积分 vs 退款流水

若 `balanced=false`：

1. 写入 `billing_ops_alert`（`alert_type=reconciliation_daily`，按日 dedupe）
2. Micrometer 计数 `billing.reconciliation.unbalanced`
3. 若启用 outbound webhook，向飞书/通用 URL POST 通知（仅**首次**插入告警时）

## 配置

| 环境变量 | 默认 | 说明 |
| --- | --- | --- |
| `BILLING_RECONCILIATION_ALERT_JOB_ENABLED` | `true` | 关闭定时 Job |
| `BILLING_RECONCILIATION_ALERT_CRON` | `0 0 2 * * *` | Spring cron（UTC） |
| `BILLING_RECONCILIATION_NOTIFY_ENABLED` | `false` | 启用 outbound webhook |
| `BILLING_RECONCILIATION_NOTIFY_WEBHOOK_URL` | 空 | 飞书机器人或自建接收端 URL |
| `BILLING_RECONCILIATION_NOTIFY_PROVIDER` | `feishu` | `feishu` 或 `generic` |

### 飞书机器人

1. 飞书群 → 设置 → 群机器人 → 添加自定义机器人 → 复制 Webhook URL
2. 设置 `BILLING_RECONCILIATION_NOTIFY_ENABLED=true` 与 `BILLING_RECONCILIATION_NOTIFY_WEBHOOK_URL=<url>`
3. 重启 billing-api

`feishu` 模式发送 `msg_type=text` JSON；`generic` 模式发送：

```json
{
  "event": "billing.reconciliation.unbalanced",
  "date": "2026-06-16",
  "balanced": false,
  "discrepancyCount": 1,
  "discrepancies": ["paid_order_count_mismatch: orders=1 ledger=0"]
}
```

## Admin 查看

- **计费 → 概览**：顶部对账状态横幅（平衡 / 差异 / 未关闭告警数）
- **计费 → 日对账**：按 UTC 日查询明细与差异项
- API：`GET /v1/admin/billing/reconciliation/status`（默认昨日）

## 排查步骤

1. 在 Admin **日对账** 面板确认差异类型（笔数 vs 积分、充值 vs 退款）
2. 对照 `billing_recharge_order` 与 `billing_ledger` 同日 `entry_type` 记录
3. 常见原因：mock-pay/webhook 重复入账、退款未完成流水、手工调账未走订单
4. 修复数据后次日 Job 应恢复 `balanced=true`；历史 `billing_ops_alert` 需人工标记 resolved（后续可补 Admin 操作）

## 监控

- 指标：`billing.reconciliation.unbalanced` 突增
- 日志：`Billing reconciliation unbalanced for <date>`
- Webhook 失败：`Failed to send reconciliation webhook`（Job 不中断，告警仍入库）

## 本地验证

```bash
cd services/billing-api
mvn test "-Dtest=ReconciliationDailyAlertJobTest,ReconciliationAlertNotifierTest"
```

Admin 侧 schema 单测：`pnpm --filter @repo/saas-admin test -- billing-admin-api.test.ts`

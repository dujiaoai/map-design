# Phase 14-5: 对象存储 WORM 与 DR 演练

合规场景下启用 S3 Object Lock（WORM）：

| 配置 | 说明 |
| --- | --- |
| `saas.object-storage.worm-enabled` | 为 true 时 PutObject 注入 ObjectLockMode |
| `saas.object-storage.object-lock-mode` | `GOVERNANCE` 或 `COMPLIANCE` |
| `saas.object-storage.dr-drill-target-bucket` | DR 演练目标 bucket |

Admin `POST /v1/admin/system/object-storage-dr-drill` 上传样本对象并校验可读性，结果写入 `object_storage_dr_drill_log` 与审计日志。

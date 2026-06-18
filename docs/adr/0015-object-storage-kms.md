# Phase 13-5: 对象存储 SSE/KMS

租户导出与 GDPR artifact 上传至 S3 时，可通过 `saas.object-storage.server-side-encryption` 启用服务端加密：

| 值 | 说明 |
| --- | --- |
| `AES256` | S3 托管密钥 |
| `aws:kms` | 需同时配置 `kms-key-id` |

密钥轮换与 bucket policy 由云账号运维负责；应用层仅注入 PutObject SSE 头。

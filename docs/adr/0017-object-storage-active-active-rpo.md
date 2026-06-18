# Phase 15-5: 对象存储跨区域 active-active 与 RPO 监控

| 配置 | 说明 |
| --- | --- |
| `saas.object-storage.active-active-enabled` | 双写主备区域 |
| `saas.object-storage.secondary-region` | 备区域标识 |
| `saas.object-storage.rpo-target-seconds` | RPO 目标秒数 |

`ObjectStorageRpoMonitorService` 估算复制延迟并写入 `object_storage_rpo_metric`；Admin `GET /v1/admin/system/object-storage-rpo` 返回达标状态。

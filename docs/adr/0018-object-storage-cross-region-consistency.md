# Phase 16-5: 对象存储跨区域一致性校验与自动修复

| 组件 | 说明 |
| --- | --- |
| `ObjectStorageConsistencyCheckService` | 比对主备 object ETag/大小并写入 `object_storage_consistency_check_log` |
| `ObjectStorageConsistencyRepairJob` | 定时对不一致 key 执行 re-copy 骨架 |
| Admin API | `POST /v1/admin/system/object-storage-consistency-check`、`GET .../consistency-status` |

`AdminObjectStoragePolicyResponse` 扩展 `consistencyCheckCount` / `consistencyMismatchCount` 供 /system 页摘要展示。

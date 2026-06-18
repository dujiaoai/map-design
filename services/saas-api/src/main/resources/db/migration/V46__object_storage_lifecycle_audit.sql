-- Phase 11-5: 对象存储生命周期策略审计骨架。
CREATE TABLE object_storage_lifecycle_audit (
    id           UUID PRIMARY KEY,
    object_key   VARCHAR(1024) NOT NULL,
    expire_days  INT           NOT NULL,
    recorded_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

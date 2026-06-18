-- Phase 15-5: 对象存储 RPO 指标。
CREATE TABLE object_storage_rpo_metric (
    id              UUID PRIMARY KEY,
    primary_region  VARCHAR(64)  NOT NULL,
    secondary_region VARCHAR(64),
    lag_seconds     BIGINT       NOT NULL,
    within_rpo      BOOLEAN      NOT NULL,
    recorded_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

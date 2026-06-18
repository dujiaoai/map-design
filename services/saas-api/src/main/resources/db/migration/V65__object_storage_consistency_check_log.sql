-- Phase 16-5: 对象存储跨区域一致性校验日志。
CREATE TABLE object_storage_consistency_check_log (
    id            UUID PRIMARY KEY,
    object_key    VARCHAR(1024) NOT NULL,
    primary_etag  VARCHAR(128),
    replica_etag  VARCHAR(128),
    primary_size  BIGINT,
    replica_size  BIGINT,
    matched       BOOLEAN      NOT NULL,
    checked_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_object_storage_consistency_checked ON object_storage_consistency_check_log (checked_at DESC);

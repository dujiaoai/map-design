-- Phase 14-5: 对象存储 DR 演练日志。
CREATE TABLE object_storage_dr_drill_log (
    id          UUID PRIMARY KEY,
    status      VARCHAR(32)  NOT NULL,
    detail      VARCHAR(512),
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

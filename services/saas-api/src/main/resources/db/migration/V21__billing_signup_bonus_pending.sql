-- 与 billing-api V1 同表；saas-api 写入失败补偿队列（IF NOT EXISTS 兼容共用 PG）
CREATE TABLE IF NOT EXISTS billing_signup_bonus_pending (
    id          UUID PRIMARY KEY,
    tenant_id   UUID NOT NULL,
    user_id     UUID NOT NULL,
    tenant_kind VARCHAR(16) NOT NULL,
    attempts    INT NOT NULL DEFAULT 0,
    last_error  TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_signup_bonus_pending UNIQUE (tenant_id, user_id)
);

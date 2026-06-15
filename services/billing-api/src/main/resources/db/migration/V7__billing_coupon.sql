CREATE TABLE billing_coupon (
    id                    UUID PRIMARY KEY,
    code                  VARCHAR(64) NOT NULL,
    points                BIGINT NOT NULL,
    status                VARCHAR(16) NOT NULL DEFAULT 'active',
    max_total_redemptions INT,
    redemption_count      INT NOT NULL DEFAULT 0,
    max_per_user          INT NOT NULL DEFAULT 1,
    valid_until           TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_coupon_code UNIQUE (code),
    CONSTRAINT chk_billing_coupon_status CHECK (status IN ('active', 'inactive')),
    CONSTRAINT chk_billing_coupon_points CHECK (points > 0),
    CONSTRAINT chk_billing_coupon_max_per_user CHECK (max_per_user > 0)
);

CREATE TABLE billing_coupon_redemption (
    id         UUID PRIMARY KEY,
    coupon_id  UUID NOT NULL,
    tenant_id  UUID NOT NULL,
    user_id    UUID NOT NULL,
    points     BIGINT NOT NULL,
    dedupe_key VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_coupon_redemption_dedupe UNIQUE (dedupe_key),
    CONSTRAINT fk_billing_coupon_redemption_coupon FOREIGN KEY (coupon_id) REFERENCES billing_coupon (id)
);

CREATE INDEX idx_billing_coupon_redemption_user
    ON billing_coupon_redemption (tenant_id, user_id, created_at DESC);

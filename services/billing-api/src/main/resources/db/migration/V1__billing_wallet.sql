-- Platform billing schema (billing-api Flyway; shared PostgreSQL with saas-api).
CREATE TABLE billing_product (
    id         UUID PRIMARY KEY,
    code       VARCHAR(64)  NOT NULL,
    name       VARCHAR(128) NOT NULL,
    status     VARCHAR(16)  NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_product_code UNIQUE (code),
    CONSTRAINT chk_billing_product_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE billing_wallet (
    id             UUID PRIMARY KEY,
    tenant_id      UUID NOT NULL,
    user_id        UUID NOT NULL,
    balance        BIGINT NOT NULL DEFAULT 0,
    frozen_balance BIGINT NOT NULL DEFAULT 0,
    version        INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_wallet_tenant_user UNIQUE (tenant_id, user_id),
    CONSTRAINT chk_billing_wallet_balance CHECK (balance >= 0),
    CONSTRAINT chk_billing_wallet_frozen CHECK (frozen_balance >= 0)
);

CREATE INDEX idx_billing_wallet_tenant ON billing_wallet (tenant_id);

CREATE TABLE billing_ledger (
    id              UUID PRIMARY KEY,
    wallet_id       UUID NOT NULL,
    tenant_id       UUID NOT NULL,
    entry_type      VARCHAR(32) NOT NULL,
    amount          BIGINT NOT NULL,
    balance_after   BIGINT NOT NULL,
    product_code    VARCHAR(64),
    remark          VARCHAR(255),
    idempotency_key VARCHAR(128) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_ledger_wallet FOREIGN KEY (wallet_id) REFERENCES billing_wallet (id),
    CONSTRAINT uq_billing_ledger_idempotency UNIQUE (idempotency_key)
);

CREATE INDEX idx_billing_ledger_wallet ON billing_ledger (wallet_id, created_at DESC);

CREATE TABLE billing_recharge_package (
    id          UUID PRIMARY KEY,
    code        VARCHAR(64) NOT NULL,
    points      BIGINT NOT NULL,
    price_cents BIGINT NOT NULL,
    currency    VARCHAR(8) NOT NULL DEFAULT 'CNY',
    status      VARCHAR(16) NOT NULL DEFAULT 'active',
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_recharge_package_code UNIQUE (code),
    CONSTRAINT chk_billing_recharge_package_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE billing_recharge_order (
    id                 UUID PRIMARY KEY,
    order_no           VARCHAR(64) NOT NULL,
    tenant_id          UUID NOT NULL,
    user_id            UUID NOT NULL,
    wallet_id          UUID NOT NULL,
    package_id         UUID NOT NULL,
    channel            VARCHAR(32) NOT NULL,
    status             VARCHAR(16) NOT NULL DEFAULT 'pending',
    points             BIGINT NOT NULL,
    price_cents        BIGINT NOT NULL,
    currency           VARCHAR(8) NOT NULL DEFAULT 'CNY',
    provider_trade_no  VARCHAR(128),
    expire_at          TIMESTAMP WITH TIME ZONE,
    paid_at            TIMESTAMP WITH TIME ZONE,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_recharge_order_no UNIQUE (order_no),
    CONSTRAINT fk_billing_recharge_order_wallet FOREIGN KEY (wallet_id) REFERENCES billing_wallet (id),
    CONSTRAINT fk_billing_recharge_order_package FOREIGN KEY (package_id) REFERENCES billing_recharge_package (id),
    CONSTRAINT chk_billing_recharge_order_status CHECK (
        status IN ('pending', 'paid', 'expired', 'cancelled', 'refunding', 'refunded')
    )
);

CREATE INDEX idx_billing_recharge_order_user ON billing_recharge_order (tenant_id, user_id, created_at DESC);

CREATE TABLE billing_consumption_rule (
    id              UUID PRIMARY KEY,
    code            VARCHAR(64) NOT NULL,
    product_code    VARCHAR(64) NOT NULL,
    points_per_unit BIGINT NOT NULL,
    unit_label      VARCHAR(64) NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_consumption_rule_code UNIQUE (code),
    CONSTRAINT fk_billing_consumption_rule_product FOREIGN KEY (product_code) REFERENCES billing_product (code),
    CONSTRAINT chk_billing_consumption_rule_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE billing_consumption_record (
    id              UUID PRIMARY KEY,
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    wallet_id       UUID NOT NULL,
    product_code    VARCHAR(64) NOT NULL,
    rule_code       VARCHAR(64) NOT NULL,
    quantity        BIGINT NOT NULL,
    points          BIGINT NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'held',
    biz_ref         VARCHAR(128),
    idempotency_key VARCHAR(128) NOT NULL,
    hold_expires_at TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_consumption_record_wallet FOREIGN KEY (wallet_id) REFERENCES billing_wallet (id),
    CONSTRAINT uq_billing_consumption_record_idempotency UNIQUE (idempotency_key),
    CONSTRAINT chk_billing_consumption_record_status CHECK (
        status IN ('held', 'confirmed', 'cancelled', 'expired')
    )
);

CREATE INDEX idx_billing_consumption_record_user ON billing_consumption_record (tenant_id, user_id, created_at DESC);

CREATE TABLE billing_signup_bonus_pending (
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

INSERT INTO billing_product (id, code, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'map-workspace', '地图工作台', 'active');

INSERT INTO billing_consumption_rule (id, code, product_code, points_per_unit, unit_label, status)
VALUES (
    '00000000-0000-0000-0000-000000000101',
    'billing.smoke.consume',
    'map-workspace',
    1,
    '次',
    'active'
);

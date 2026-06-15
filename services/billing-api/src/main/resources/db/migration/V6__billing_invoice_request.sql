CREATE TABLE billing_invoice_request (
    id           UUID PRIMARY KEY,
    tenant_id    UUID NOT NULL,
    user_id      UUID NOT NULL,
    order_no     VARCHAR(64) NOT NULL,
    invoice_type VARCHAR(16) NOT NULL,
    title        VARCHAR(128) NOT NULL,
    tax_no       VARCHAR(32),
    email        VARCHAR(128) NOT NULL,
    status       VARCHAR(16) NOT NULL DEFAULT 'pending',
    amount_cents BIGINT NOT NULL,
    currency     VARCHAR(8) NOT NULL DEFAULT 'CNY',
    admin_remark VARCHAR(255),
    dedupe_key   VARCHAR(128) NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_invoice_request_dedupe UNIQUE (dedupe_key),
    CONSTRAINT chk_billing_invoice_request_status CHECK (
        status IN ('pending', 'issued', 'rejected')
    ),
    CONSTRAINT chk_billing_invoice_request_type CHECK (
        invoice_type IN ('personal', 'enterprise')
    )
);

CREATE INDEX idx_billing_invoice_request_user
    ON billing_invoice_request (tenant_id, user_id, created_at DESC);

CREATE INDEX idx_billing_invoice_request_status
    ON billing_invoice_request (status, created_at DESC);

CREATE TABLE billing_wire_transfer_request (
    id              UUID PRIMARY KEY,
    request_no      VARCHAR(64) NOT NULL,
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    company_name    VARCHAR(128) NOT NULL,
    contact_email   VARCHAR(128) NOT NULL,
    amount_cents    BIGINT NOT NULL,
    points          BIGINT NOT NULL,
    bank_reference  VARCHAR(128),
    status          VARCHAR(16) NOT NULL DEFAULT 'pending',
    admin_remark    VARCHAR(255),
    credited_ledger_id UUID,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_wire_transfer_request_no UNIQUE (request_no),
    CONSTRAINT chk_billing_wire_transfer_request_status CHECK (
        status IN ('pending', 'credited', 'rejected')
    ),
    CONSTRAINT chk_billing_wire_transfer_request_amount CHECK (amount_cents > 0),
    CONSTRAINT chk_billing_wire_transfer_request_points CHECK (points > 0)
);

CREATE INDEX idx_billing_wire_transfer_request_user
    ON billing_wire_transfer_request (tenant_id, user_id, created_at DESC);

CREATE INDEX idx_billing_wire_transfer_request_status
    ON billing_wire_transfer_request (status, created_at DESC);

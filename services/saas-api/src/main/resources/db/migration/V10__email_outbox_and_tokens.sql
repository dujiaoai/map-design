CREATE TABLE sys_email_outbox (
    id            UUID PRIMARY KEY,
    tenant_id     UUID,
    user_id       UUID,
    template      VARCHAR(64)  NOT NULL,
    to_email      VARCHAR(255) NOT NULL,
    payload_json  TEXT,
    status        VARCHAR(16)  NOT NULL DEFAULT 'pending',
    error_message VARCHAR(512),
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at       TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sys_email_verification_token (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL,
    purpose     VARCHAR(32) NOT NULL,
    token_hash  VARCHAR(64) NOT NULL,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_token_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
);

CREATE INDEX idx_email_outbox_user ON sys_email_outbox (user_id);
CREATE INDEX idx_email_outbox_status ON sys_email_outbox (status, created_at);
CREATE INDEX idx_email_token_lookup ON sys_email_verification_token (token_hash, purpose);

CREATE TABLE sys_user_oauth_bind (
    id                UUID PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES sys_user (id) ON DELETE CASCADE,
    provider_id       VARCHAR(64) NOT NULL,
    provider_subject  VARCHAR(255) NOT NULL,
    email_snapshot    VARCHAR(320),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sys_user_oauth_bind_provider_subject UNIQUE (provider_id, provider_subject)
);

CREATE INDEX idx_sys_user_oauth_bind_user ON sys_user_oauth_bind (user_id);

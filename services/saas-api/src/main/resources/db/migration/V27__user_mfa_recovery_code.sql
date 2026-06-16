CREATE TABLE sys_user_mfa_recovery_code (
    id         UUID PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES sys_user(id) ON DELETE CASCADE,
    code_hash  VARCHAR(128) NOT NULL,
    used_at    TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sys_user_mfa_recovery_code_user ON sys_user_mfa_recovery_code (user_id);

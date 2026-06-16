CREATE TABLE sys_user_mfa_totp (
    user_id            UUID PRIMARY KEY,
    secret_ciphertext  VARCHAR(512) NOT NULL,
    verified_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sys_user_mfa_totp_verified ON sys_user_mfa_totp (verified_at DESC);

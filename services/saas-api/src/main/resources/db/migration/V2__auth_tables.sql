-- Auth + tenant core tables (PostgreSQL dev; H2 test uses PostgreSQL compatibility mode).
CREATE TABLE sys_tenant (
    id         UUID PRIMARY KEY,
    name       VARCHAR(128) NOT NULL,
    slug       VARCHAR(64)  NOT NULL,
    plan       VARCHAR(32)  NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sys_tenant_slug UNIQUE (slug)
);

CREATE TABLE sys_user (
    id            UUID PRIMARY KEY,
    tenant_id     UUID NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(128),
    status        VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sys_user_tenant FOREIGN KEY (tenant_id) REFERENCES sys_tenant (id),
    CONSTRAINT uq_sys_user_tenant_email UNIQUE (tenant_id, email)
);

CREATE TABLE sys_role (
    id   UUID PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    CONSTRAINT uq_sys_role_code UNIQUE (code)
);

CREATE TABLE sys_user_role (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_sys_user_role_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
    CONSTRAINT fk_sys_user_role_role FOREIGN KEY (role_id) REFERENCES sys_role (id)
);

CREATE INDEX idx_sys_user_tenant ON sys_user (tenant_id);

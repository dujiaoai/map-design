-- SCIM PoC test token for tenant OTHER (99999999-9999-9999-9999-999999999901).
-- Raw token: scim-test-token
-- Hash uses test-invite-pepper from application-test.yml
INSERT INTO scim_provisioning_token (tenant_id, token_hash, enabled, created_at)
VALUES (
    '99999999-9999-9999-9999-999999999901',
    '9895bbeb1aa22ab5e451c4b02266e2ddd88d3fe73659c7c6bf11934c98c83d7a',
    TRUE,
    CURRENT_TIMESTAMP
);

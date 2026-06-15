package com.yunyan.billingapi;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;

/** Seeds minimal {@code sys_user} rows for billing-api integration tests. */
public final class BillingTestMembershipSupport {

  private BillingTestMembershipSupport() {}

  public static void ensureSchema(JdbcTemplate jdbcTemplate) {
    jdbcTemplate.execute(
        """
        CREATE TABLE IF NOT EXISTS sys_user (
          id UUID PRIMARY KEY,
          tenant_id UUID NOT NULL,
          email VARCHAR(255),
          status VARCHAR(32) NOT NULL
        )
        """);
  }

  public static void seedTenantMember(
      JdbcTemplate jdbcTemplate, UUID tenantId, UUID userId, String status) {
    ensureSchema(jdbcTemplate);
    jdbcTemplate.update("DELETE FROM sys_user WHERE id = ?", userId);
    jdbcTemplate.update(
        """
        INSERT INTO sys_user (id, tenant_id, email, status)
        VALUES (?, ?, ?, ?)
        """,
        userId,
        tenantId,
        userId + "@billing-test.local",
        status);
  }
}

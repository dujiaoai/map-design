package com.yunyan.billingapi.application.tenant;

import com.yunyan.billingapi.security.AuthException;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class TenantMembershipService {

  private final JdbcTemplate jdbcTemplate;

  public TenantMembershipService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void requireTenantMember(UUID tenantId, UUID userId) {
    if (!isTenantMember(tenantId, userId)) {
      throw AuthException.notFound("User is not a member of this tenant");
    }
  }

  public boolean isTenantMember(UUID tenantId, UUID userId) {
    if (tenantId == null || userId == null) {
      return false;
    }
    var count =
        jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM sys_user
            WHERE id = ? AND tenant_id = ? AND status IN ('active', 'disabled', 'pending')
            """,
            Integer.class,
            userId,
            tenantId);
    return count != null && count > 0;
  }
}

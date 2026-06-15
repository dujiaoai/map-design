package com.yunyan.billingapi.application.tenant;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.infrastructure.saas.SaasMembershipApiClient;
import com.yunyan.billingapi.security.AuthException;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class TenantMembershipService {

  private final BillingAppProperties billingAppProperties;
  private final JdbcTemplate jdbcTemplate;
  private final ObjectProvider<SaasMembershipApiClient> saasMembershipApiClient;

  public TenantMembershipService(
      BillingAppProperties billingAppProperties,
      JdbcTemplate jdbcTemplate,
      ObjectProvider<SaasMembershipApiClient> saasMembershipApiClient) {
    this.billingAppProperties = billingAppProperties;
    this.jdbcTemplate = jdbcTemplate;
    this.saasMembershipApiClient = saasMembershipApiClient;
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
    if (usesApiSource()) {
      var client = saasMembershipApiClient.getIfAvailable();
      if (client == null) {
        throw AuthException.badRequest(
            "billing.membership-sync.source=api but SaasMembershipApiClient is unavailable");
      }
      return client.isTenantMember(tenantId, userId);
    }
    return isTenantMemberFromLocalMirror(tenantId, userId);
  }

  private boolean usesApiSource() {
    return "api".equalsIgnoreCase(billingAppProperties.getMembershipSync().getSource())
        && StringUtils.hasText(billingAppProperties.getMembershipSync().getSaasApiBaseUrl());
  }

  private boolean isTenantMemberFromLocalMirror(UUID tenantId, UUID userId) {
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

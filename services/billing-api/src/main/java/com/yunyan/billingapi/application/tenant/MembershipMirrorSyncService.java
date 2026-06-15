package com.yunyan.billingapi.application.tenant;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(prefix = "billing.membership-sync", name = "enabled", havingValue = "true")
public class MembershipMirrorSyncService {

  private final JdbcTemplate billingJdbcTemplate;
  private final JdbcTemplate saasMirrorJdbcTemplate;

  public MembershipMirrorSyncService(
      JdbcTemplate billingJdbcTemplate,
      @Qualifier("saasMirrorJdbcTemplate") JdbcTemplate saasMirrorJdbcTemplate) {
    this.billingJdbcTemplate = billingJdbcTemplate;
    this.saasMirrorJdbcTemplate = saasMirrorJdbcTemplate;
  }

  public record SyncResult(int userCount, int featureCount) {}

  record UserMirrorRow(UUID id, UUID tenantId, String email, String status) {}

  record FeatureMirrorRow(UUID tenantId, String featureCode) {}

  @Transactional
  public SyncResult syncFromSaas() {
    var users =
        saasMirrorJdbcTemplate.query(
            """
            SELECT id, tenant_id, email, status
            FROM sys_user
            WHERE status IN ('active', 'disabled', 'pending')
            """,
            (rs, rowNum) ->
                new UserMirrorRow(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("tenant_id")),
                    rs.getString("email"),
                    rs.getString("status")));

    billingJdbcTemplate.update("DELETE FROM sys_user");
    for (var user : users) {
      billingJdbcTemplate.update(
          """
          INSERT INTO sys_user (id, tenant_id, email, status)
          VALUES (?, ?, ?, ?)
          """,
          user.id(),
          user.tenantId(),
          user.email(),
          user.status());
    }

    var features =
        saasMirrorJdbcTemplate.query(
            """
            SELECT tenant_id, feature_code
            FROM sys_tenant_feature
            """,
            (rs, rowNum) ->
                new FeatureMirrorRow(
                    UUID.fromString(rs.getString("tenant_id")), rs.getString("feature_code")));

    billingJdbcTemplate.update("DELETE FROM sys_tenant_feature");
    for (var feature : features) {
      billingJdbcTemplate.update(
          """
          INSERT INTO sys_tenant_feature (tenant_id, feature_code)
          VALUES (?, ?)
          """,
          feature.tenantId(),
          feature.featureCode());
    }

    return new SyncResult(users.size(), features.size());
  }
}

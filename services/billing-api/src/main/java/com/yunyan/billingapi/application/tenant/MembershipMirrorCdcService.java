package com.yunyan.billingapi.application.tenant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.infrastructure.saas.SaasMembershipSyncEventClient;
import com.yunyan.billingapi.infrastructure.saas.SaasMembershipSyncEventClient.MembershipSyncEvent;
import com.yunyan.billingapi.security.AuthException;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@ConditionalOnProperty(prefix = "billing.membership-sync", name = "source", havingValue = "cdc")
public class MembershipMirrorCdcService {

  public static final String EVENT_USER_UPSERT = "user_upsert";
  public static final String EVENT_TENANT_FEATURES_REPLACE = "tenant_features_replace";

  private final SaasMembershipSyncEventClient saasMembershipSyncEventClient;
  private final JdbcTemplate jdbcTemplate;
  private final ObjectMapper objectMapper;

  public MembershipMirrorCdcService(
      SaasMembershipSyncEventClient saasMembershipSyncEventClient,
      JdbcTemplate jdbcTemplate,
      ObjectMapper objectMapper) {
    this.saasMembershipSyncEventClient = saasMembershipSyncEventClient;
    this.jdbcTemplate = jdbcTemplate;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public int syncPendingEvents(int limit) {
    var events = saasMembershipSyncEventClient.fetchPending(limit);
    if (events.isEmpty()) {
      return 0;
    }
    for (var event : events) {
      applyEvent(event);
    }
    saasMembershipSyncEventClient.acknowledge(events.stream().map(MembershipSyncEvent::id).toList());
    return events.size();
  }

  private void applyEvent(MembershipSyncEvent event) {
    if (!StringUtils.hasText(event.eventType())) {
      throw AuthException.badRequest("Membership sync event missing eventType");
    }
    try {
      var payload = objectMapper.readTree(event.payload() != null ? event.payload() : "{}");
      switch (event.eventType()) {
        case EVENT_USER_UPSERT -> applyUserUpsert(payload);
        case EVENT_TENANT_FEATURES_REPLACE -> applyTenantFeaturesReplace(payload);
        default ->
            throw AuthException.badRequest("Unsupported membership sync event: " + event.eventType());
      }
    } catch (java.io.IOException ex) {
      throw new AuthException(HttpStatus.BAD_GATEWAY, "Membership sync payload parse failed");
    }
  }

  private void applyUserUpsert(JsonNode payload) {
    var userId = UUID.fromString(payload.path("id").asText());
    var tenantId = UUID.fromString(payload.path("tenantId").asText());
    var email = payload.path("email").asText("");
    var status = payload.path("status").asText("active");

    jdbcTemplate.update("DELETE FROM sys_user WHERE id = ?", userId);
    jdbcTemplate.update(
        """
        INSERT INTO sys_user (id, tenant_id, email, status)
        VALUES (?, ?, ?, ?)
        """,
        userId,
        tenantId,
        email,
        status);
  }

  private void applyTenantFeaturesReplace(JsonNode payload) {
    var tenantId = UUID.fromString(payload.path("tenantId").asText());
    jdbcTemplate.update("DELETE FROM sys_tenant_feature WHERE tenant_id = ?", tenantId);
    var featureCodes = payload.path("featureCodes");
    if (!featureCodes.isArray()) {
      return;
    }
    for (JsonNode featureCodeNode : featureCodes) {
      var featureCode = featureCodeNode.asText(null);
      if (!StringUtils.hasText(featureCode)) {
        continue;
      }
      jdbcTemplate.update(
          """
          INSERT INTO sys_tenant_feature (tenant_id, feature_code)
          VALUES (?, ?)
          """,
          tenantId,
          featureCode.trim());
    }
  }
}

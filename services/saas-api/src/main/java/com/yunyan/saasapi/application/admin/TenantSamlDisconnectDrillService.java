package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.saml.SamlAuthnRequestBuilder;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.TenantSamlDisconnectDrillLogRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpFederationRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlDisconnectDrillLog;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.TenantSamlDisconnectDrillResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlDisconnectDrillService {

  private static final String RESULT_SUCCESS = "success";
  private static final String RESULT_FAILURE = "failure";

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final TenantSamlIdpFederationRepository federationRepository;
  private final TenantSamlDisconnectDrillLogRepository drillLogRepository;
  private final SamlAuthnRequestBuilder authnRequestBuilder;
  private final AuditWebhookHttpClient httpClient;
  private final AdminAuditLogService adminAuditLogService;
  private final SaasAppProperties saasAppProperties;

  @Transactional
  public TenantSamlDisconnectDrillResponse runDrill(SaasPrincipal principal, UUID tenantId, String idpEntityId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config =
        samlConfigRepository
            .findByTenantId(tenantId)
            .orElseThrow(() -> AuthException.badRequest("SAML not configured"));
    if (!Boolean.TRUE.equals(config.getEnabled())) {
      throw AuthException.badRequest("SAML is disabled");
    }
    var target = resolveTarget(config, tenantId, idpEntityId);
    var acsUrl = resolveAcsUrl(config);
    var spEntityId = resolveSpEntityId(config);
    var relayState = UUID.randomUUID().toString();
    var started = System.currentTimeMillis();
    String result;
    try {
      var redirectUrl =
          authnRequestBuilder.buildRedirectUrl(target.ssoUrl(), spEntityId, acsUrl, relayState);
      var ok = StringUtils.hasText(redirectUrl) && httpClient.pingTarget(target.ssoUrl());
      result = ok ? RESULT_SUCCESS : RESULT_FAILURE;
    } catch (Exception ex) {
      result = RESULT_FAILURE;
    }
    var latencyMs = System.currentTimeMillis() - started;
    var row = new TenantSamlDisconnectDrillLog();
    row.setId(UUID.randomUUID());
    row.setTenantId(tenantId);
    row.setIdpEntityId(target.entityId());
    row.setResult(result);
    row.setLatencyMs(latencyMs);
    row.setDrilledAt(Instant.now());
    drillLogRepository.insert(row);
    adminAuditLogService.recordTenantAction(
        principal, "tenant.saml_disconnect_drill", tenantId, "Drill " + result + " for " + target.entityId());
    return new TenantSamlDisconnectDrillResponse(row.getId(), target.entityId(), result, latencyMs);
  }

  private record IdpTarget(String entityId, String ssoUrl) {}

  private IdpTarget resolveTarget(
      com.yunyan.saasapi.domain.entity.TenantSamlConfig config, UUID tenantId, String idpEntityId) {
    if (StringUtils.hasText(idpEntityId)) {
      for (var fed : federationRepository.listByTenantId(tenantId)) {
        if (idpEntityId.equals(fed.getIdpEntityId())) {
          return new IdpTarget(fed.getIdpEntityId(), fed.getSsoUrl());
        }
      }
      throw AuthException.notFound("Federation IdP not found: " + idpEntityId);
    }
    if (!StringUtils.hasText(config.getSsoUrl())) {
      throw AuthException.badRequest("Primary IdP SSO URL missing");
    }
    return new IdpTarget(
        StringUtils.hasText(config.getEntityId()) ? config.getEntityId() : "primary",
        config.getSsoUrl());
  }

  private String resolveAcsUrl(com.yunyan.saasapi.domain.entity.TenantSamlConfig config) {
    if (StringUtils.hasText(config.getAcsUrl())) {
      return config.getAcsUrl();
    }
    return saasAppProperties.getApp().getWebBaseUrl() + "/auth/saml/acs";
  }

  private String resolveSpEntityId(com.yunyan.saasapi.domain.entity.TenantSamlConfig config) {
    if (StringUtils.hasText(config.getSpEntityId())) {
      return config.getSpEntityId();
    }
    return config.getEntityId();
  }
}

package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpFederationRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.TenantSamlIdpHealthDto;
import com.yunyan.saasapi.web.dto.admin.TenantSamlIdpHealthResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlIdpHealthService {

  private static final long METADATA_STALE_DAYS = 7;

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final TenantSamlIdpFederationRepository federationRepository;
  private final AuditWebhookHttpClient httpClient;

  public TenantSamlIdpHealthResponse assess(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    List<TenantSamlIdpHealthDto> items = new ArrayList<>();
    var config = samlConfigRepository.findByTenantId(tenantId).orElse(null);
    if (config != null && Boolean.TRUE.equals(config.getEnabled()) && StringUtils.hasText(config.getSsoUrl())) {
      items.add(assessPrimary(config.getEntityId(), config.getSsoUrl(), config.getLastMetadataSyncAt()));
    }
    for (var fed : federationRepository.listByTenantId(tenantId)) {
      if (!Boolean.TRUE.equals(fed.getEnabled())) {
        continue;
      }
      items.add(assessFederation(fed.getIdpEntityId(), fed.getSsoUrl()));
    }
    return new TenantSamlIdpHealthResponse(items);
  }

  private TenantSamlIdpHealthDto assessPrimary(String entityId, String ssoUrl, Instant lastSyncAt) {
    var ssoReachable = httpClient.pingTarget(ssoUrl);
    var metadataFresh = isMetadataFresh(lastSyncAt);
    var healthy = ssoReachable && metadataFresh;
    return new TenantSamlIdpHealthDto(entityId, ssoUrl, ssoReachable, metadataFresh, healthy, "primary");
  }

  private TenantSamlIdpHealthDto assessFederation(String entityId, String ssoUrl) {
    var ssoReachable = httpClient.pingTarget(ssoUrl);
    return new TenantSamlIdpHealthDto(entityId, ssoUrl, ssoReachable, true, ssoReachable, "federation");
  }

  private static boolean isMetadataFresh(Instant lastSyncAt) {
    if (lastSyncAt == null) {
      return false;
    }
    return lastSyncAt.isAfter(Instant.now().minus(METADATA_STALE_DAYS, ChronoUnit.DAYS));
  }
}

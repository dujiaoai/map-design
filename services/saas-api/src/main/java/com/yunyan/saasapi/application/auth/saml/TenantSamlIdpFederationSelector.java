package com.yunyan.saasapi.application.auth.saml;

import com.yunyan.saasapi.domain.TenantSamlIdpFederationRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpFederation;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class TenantSamlIdpFederationSelector {

  private final TenantSamlIdpFederationRepository federationRepository;

  public List<TenantSamlIdpFederation> listCandidates(UUID tenantId) {
    return federationRepository.listEnabledByTenantIdOrdered(tenantId);
  }

  public Optional<TenantSamlIdpFederation> selectByRelayState(UUID tenantId, String relayState) {
    if (!StringUtils.hasText(relayState)) {
      return Optional.empty();
    }
    var candidates = listCandidates(tenantId);
    for (var candidate : candidates) {
      if (relayState.equals(candidate.getId().toString())) {
        return Optional.of(candidate);
      }
    }
    return Optional.empty();
  }
}

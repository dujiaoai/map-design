package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.config.SaasAppProperties.OAuth2Provider;
import com.yunyan.saasapi.web.dto.auth.OidcProvidersResponse;
import com.yunyan.saasapi.web.dto.auth.OidcProvidersResponse.OidcProviderSummary;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OidcAuthService {

  private final SaasAppProperties saasAppProperties;

  public OidcProvidersResponse getProviders() {
    var oauth2 = saasAppProperties.getAuth().getOauth2();
    var configured = configuredProviders(oauth2.getProviders());
    var enabled = oauth2.isEnabled() && !configured.isEmpty();
    return new OidcProvidersResponse(
        enabled,
        false,
        configured.stream()
            .map(provider -> new OidcProviderSummary(provider.getId(), provider.getDisplayName()))
            .toList());
  }

  public int countConfiguredProviders() {
    return configuredProviders(saasAppProperties.getAuth().getOauth2().getProviders()).size();
  }

  public boolean isEnabled() {
    var oauth2 = saasAppProperties.getAuth().getOauth2();
    return oauth2.isEnabled() && !configuredProviders(oauth2.getProviders()).isEmpty();
  }

  private static List<OAuth2Provider> configuredProviders(List<OAuth2Provider> providers) {
    if (providers == null || providers.isEmpty()) {
      return List.of();
    }
    return providers.stream().filter(OidcAuthService::isConfigured).toList();
  }

  private static boolean isConfigured(OAuth2Provider provider) {
    return provider != null
        && StringUtils.hasText(provider.getId())
        && StringUtils.hasText(provider.getDisplayName())
        && StringUtils.hasText(provider.getIssuerUri())
        && StringUtils.hasText(provider.getClientId());
  }
}

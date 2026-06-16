package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.config.SaasAppProperties.OAuth2Provider;
import com.yunyan.saasapi.domain.UserOauthBindRepository;
import com.yunyan.saasapi.domain.entity.SysUserOauthBind;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.UserOauthBindsResponse;
import com.yunyan.saasapi.web.dto.auth.UserOauthBindsResponse.UserOauthBindItemDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserOauthBindService {

  private final UserOauthBindRepository userOauthBindRepository;
  private final SaasAppProperties saasAppProperties;

  public UserOauthBindsResponse listForCurrentUser(SaasPrincipal principal) {
    requirePrincipal(principal);
    return listForUserId(principal.userId());
  }

  public UserOauthBindsResponse listForUserId(UUID userId) {
    var binds = userOauthBindRepository.findByUserId(userId);
    return new UserOauthBindsResponse(binds.stream().map(this::toDto).toList());
  }

  public void unbindForCurrentUser(SaasPrincipal principal, String providerId) {
    requirePrincipal(principal);
    unbindForUserId(principal.userId(), providerId);
  }

  public void unbindForUserId(UUID userId, String providerId) {
    if (!StringUtils.hasText(providerId)) {
      throw AuthException.badRequest("providerId is required");
    }
    var removed =
        userOauthBindRepository.deleteByUserIdAndProviderId(userId, providerId.trim());
    if (!removed) {
      throw AuthException.notFound("OAuth bind not found");
    }
  }

  private UserOauthBindItemDto toDto(SysUserOauthBind row) {
    return new UserOauthBindItemDto(
        row.getProviderId(),
        resolveProviderDisplayName(row.getProviderId()),
        row.getEmailSnapshot(),
        row.getCreatedAt(),
        row.getLastUsedAt());
  }

  private String resolveProviderDisplayName(String providerId) {
    return saasAppProperties.getAuth().getOauth2().getProviders().stream()
        .filter(provider -> providerId.equals(provider.getId()))
        .map(OAuth2Provider::getDisplayName)
        .filter(StringUtils::hasText)
        .findFirst()
        .orElse(providerId);
  }

  private static void requirePrincipal(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
  }
}

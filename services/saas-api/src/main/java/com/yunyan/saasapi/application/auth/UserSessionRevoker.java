package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.email.SecurityNotificationService;
import com.yunyan.saasapi.config.JwtProperties;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AccessTokenDenylist;
import com.yunyan.saasapi.security.RefreshTokenStore;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class UserSessionRevoker {

  private static final String STATUS_DISABLED = "disabled";

  private final RefreshTokenStore refreshTokenStore;
  private final AccessTokenDenylist accessTokenDenylist;
  private final JwtProperties jwtProperties;
  private final SecurityNotificationService securityNotificationService;

  public void handleUserStatusChange(String previousStatus, String newStatus, SysUser user) {
    revokeRefreshTokenIfNewlyDisabled(previousStatus, newStatus, user.getId());
    if (isNewlyDisabled(previousStatus, newStatus)) {
      denyActiveAccessTokens(user.getId());
      securityNotificationService.notifyAccountDisabled(user);
    }
  }

  /** 角色/权限变更后强制重新登录以刷新 JWT 内 permissions claim */
  public void revokeActiveSessions(UUID userId) {
    refreshTokenStore
        .findActiveJti(userId)
        .ifPresent(jti -> refreshTokenStore.revoke(userId, jti));
    denyActiveAccessTokens(userId);
  }

  public void revokeRefreshTokenIfNewlyDisabled(String previousStatus, String newStatus, UUID userId) {
    if (!isNewlyDisabled(previousStatus, newStatus)) {
      return;
    }
    refreshTokenStore
        .findActiveJti(userId)
        .ifPresent(jti -> refreshTokenStore.revoke(userId, jti));
  }

  private void denyActiveAccessTokens(UUID userId) {
    accessTokenDenylist.denyUser(userId, jwtProperties.accessTtl());
  }

  private static boolean isNewlyDisabled(String previousStatus, String newStatus) {
    if (!StringUtils.hasText(newStatus) || !STATUS_DISABLED.equalsIgnoreCase(newStatus.trim())) {
      return false;
    }
    return previousStatus == null || !STATUS_DISABLED.equalsIgnoreCase(previousStatus);
  }
}

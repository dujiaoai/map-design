package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.email.SecurityNotificationService;
import com.yunyan.saasapi.domain.entity.SysUser;
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
  private final SecurityNotificationService securityNotificationService;

  public void handleUserStatusChange(String previousStatus, String newStatus, SysUser user) {
    revokeRefreshTokenIfNewlyDisabled(previousStatus, newStatus, user.getId());
    if (isNewlyDisabled(previousStatus, newStatus)) {
      securityNotificationService.notifyAccountDisabled(user);
    }
  }

  public void revokeRefreshTokenIfNewlyDisabled(String previousStatus, String newStatus, UUID userId) {
    if (!isNewlyDisabled(previousStatus, newStatus)) {
      return;
    }
    refreshTokenStore
        .findActiveJti(userId)
        .ifPresent(jti -> refreshTokenStore.revoke(userId, jti));
  }

  private static boolean isNewlyDisabled(String previousStatus, String newStatus) {
    if (!StringUtils.hasText(newStatus) || !STATUS_DISABLED.equalsIgnoreCase(newStatus.trim())) {
      return false;
    }
    return previousStatus == null || !STATUS_DISABLED.equalsIgnoreCase(previousStatus);
  }
}

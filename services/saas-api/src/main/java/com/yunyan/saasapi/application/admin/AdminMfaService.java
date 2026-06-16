package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.UserMfaTotpRepository;
import com.yunyan.saasapi.domain.entity.SysUserMfaTotp;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.mfa.MfaPendingEnrollStore;
import com.yunyan.saasapi.security.mfa.MfaSecretCipher;
import com.yunyan.saasapi.security.mfa.TotpSupport;
import com.yunyan.saasapi.web.dto.admin.AdminMfaStatusResponse;
import com.yunyan.saasapi.web.dto.admin.TotpDisableRequest;
import com.yunyan.saasapi.web.dto.admin.TotpEnrollResponse;
import com.yunyan.saasapi.web.dto.admin.TotpVerifyRequest;
import com.yunyan.saasapi.security.AuthException;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminMfaService {

  private static final Duration PENDING_ENROLL_TTL = Duration.ofMinutes(10);

  private final SaasAppProperties saasAppProperties;
  private final UserMfaTotpRepository userMfaTotpRepository;
  private final MfaPendingEnrollStore mfaPendingEnrollStore;
  private final MfaSecretCipher mfaSecretCipher;
  private final TotpSupport totpSupport;
  private final AdminAuditLogService adminAuditLogService;

  public AdminMfaStatusResponse getStatus(SaasPrincipal principal) {
    Objects.requireNonNull(principal, "principal");
    var adminMfa = saasAppProperties.getAuth().getAdminMfa();
    var enrolled = userMfaTotpRepository.findByUserId(principal.userId());
    return new AdminMfaStatusResponse(
        adminMfa.isEnforcementEnabled(),
        true,
        enrolled.isPresent(),
        enrolled.map(row -> row.getVerifiedAt().toEpochMilli()).orElse(null));
  }

  public int countEnrolledPlatformAdmins() {
    return userMfaTotpRepository.countEnrolled();
  }

  public boolean isEnrolled(UUID userId) {
    return userMfaTotpRepository.findByUserId(userId).isPresent();
  }

  public boolean verifyEnrolledCode(UUID userId, String code) {
    var row = userMfaTotpRepository.findByUserId(userId).orElse(null);
    if (row == null) {
      return false;
    }
    var secret = mfaSecretCipher.decrypt(row.getSecretCiphertext());
    return totpSupport.verifyCode(secret, code);
  }

  @Transactional
  public TotpEnrollResponse startTotpEnroll(SaasPrincipal principal) {
    requirePlatformAdmin(principal);
    if (userMfaTotpRepository.findByUserId(principal.userId()).isPresent()) {
      throw AuthException.conflict("TOTP already enrolled");
    }
    var secret = totpSupport.generateSecret();
    mfaPendingEnrollStore.store(principal.userId(), secret, PENDING_ENROLL_TTL);
    adminAuditLogService.recordPlatformUserAction(
        principal, "mfa.totp.enroll", principal.userId(), "pending");
    return new TotpEnrollResponse(
        secret,
        totpSupport.buildOtpauthUri(secret, principal.email()),
        totpSupport.buildQrCodeDataUrl(secret, principal.email()));
  }

  @Transactional
  public AdminMfaStatusResponse verifyTotpEnroll(SaasPrincipal principal, TotpVerifyRequest request) {
    requirePlatformAdmin(principal);
    if (userMfaTotpRepository.findByUserId(principal.userId()).isPresent()) {
      throw AuthException.conflict("TOTP already enrolled");
    }
    var pendingSecret =
        mfaPendingEnrollStore
            .find(principal.userId())
            .orElseThrow(() -> AuthException.badRequest("TOTP enrollment expired or not started"));
    if (!totpSupport.verifyCode(pendingSecret, request.code())) {
      throw AuthException.unauthorized("Invalid TOTP code");
    }
    mfaPendingEnrollStore.consume(principal.userId());
    var now = Instant.now();
    var row = new SysUserMfaTotp();
    row.setUserId(principal.userId());
    row.setSecretCiphertext(mfaSecretCipher.encrypt(pendingSecret));
    row.setVerifiedAt(now);
    row.setCreatedAt(now);
    userMfaTotpRepository.upsert(row);
    adminAuditLogService.recordPlatformUserAction(
        principal, "mfa.totp.verify", principal.userId(), "enrolled");
    return getStatus(principal);
  }

  @Transactional
  public AdminMfaStatusResponse disableTotp(SaasPrincipal principal, TotpDisableRequest request) {
    requirePlatformAdmin(principal);
    var row =
        userMfaTotpRepository
            .findByUserId(principal.userId())
            .orElseThrow(() -> AuthException.badRequest("TOTP not enrolled"));
    var secret = mfaSecretCipher.decrypt(row.getSecretCiphertext());
    if (!totpSupport.verifyCode(secret, request.code())) {
      throw AuthException.unauthorized("Invalid TOTP code");
    }
    userMfaTotpRepository.deleteByUserId(principal.userId());
    mfaPendingEnrollStore.clear(principal.userId());
    adminAuditLogService.recordPlatformUserAction(
        principal, "mfa.totp.disable", principal.userId(), null);
    return getStatus(principal);
  }

  public void requireEnrolledWhenForced(SaasPrincipal principal) {
    if (!isPlatformAdmin(principal)) {
      return;
    }
    if (!saasAppProperties.getAuth().getAdminMfa().isEnforcementEnabled()) {
      return;
    }
    if (!isEnrolled(principal.userId())) {
      throw AuthException.forbidden("Admin MFA enrollment required");
    }
  }

  /** 已绑定 TOTP 的平台管理员代操作前须校验动态码。 */
  public void requireTotpForImpersonation(UUID userId, String totpCode) {
    if (!isEnrolled(userId)) {
      return;
    }
    if (!StringUtils.hasText(totpCode) || !totpCode.trim().matches("\\d{6}")) {
      throw AuthException.badRequest("TOTP code required for impersonation");
    }
    if (!verifyEnrolledCode(userId, totpCode.trim())) {
      throw AuthException.unauthorized("Invalid TOTP code");
    }
  }

  private static void requirePlatformAdmin(SaasPrincipal principal) {
    if (!isPlatformAdmin(principal)) {
      throw AuthException.forbidden("Platform admin required");
    }
  }

  static boolean isPlatformAdmin(SaasPrincipal principal) {
    return hasPlatformAdminAccess(principal.permissionCodes());
  }

  public static boolean hasPlatformAdminAccess(java.util.List<String> permissionCodes) {
    return permissionCodes.contains(com.yunyan.saasapi.domain.permission.PermissionCodes.ADMIN_TENANTS_READ);
  }
}

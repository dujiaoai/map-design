package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.application.auth.UserAuthRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.TenantContext;
import com.yunyan.saasapi.web.dto.admin.StartImpersonationRequest;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ImpersonationAdminService {

  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";

  private final UserAuthRepository userAuthRepository;
  private final TenantRepository tenantRepository;
  private final AuthService authService;
  private final AdminAuditLogService adminAuditLogService;

  @Transactional
  public LoginResponse start(SaasPrincipal principal, StartImpersonationRequest request) {
    assertCanImpersonate(principal);
    var tenantId = request.tenantId();
    if (tenantId.equals(principal.tenantId())) {
      throw AuthException.badRequest("Cannot impersonate home tenant");
    }
    tenantRepository
        .findById(tenantId)
        .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var reason = request.reason().trim();
    if (!StringUtils.hasText(reason)) {
      throw AuthException.badRequest("reason is required");
    }

    var user =
        TenantContext.withTenant(
            principal.tenantId().toString(),
            () ->
                userAuthRepository
                    .findById(principal.userId())
                    .orElseThrow(() -> AuthException.unauthorized("User not found")));

    adminAuditLogService.recordImpersonationAction(
        principal, "impersonation.start", tenantId, reason);
    return authService.issueSessionTokens(user, tenantId, principal);
  }

  @Transactional
  public LoginResponse stop(SaasPrincipal principal) {
    assertCanImpersonate(principal);
    if (!principal.isImpersonating()) {
      throw AuthException.badRequest("Not impersonating");
    }

    var targetTenantId = principal.actAsTenantId();
    var user =
        TenantContext.withTenant(
            principal.tenantId().toString(),
            () ->
                userAuthRepository
                    .findById(principal.userId())
                    .orElseThrow(() -> AuthException.unauthorized("User not found")));

    adminAuditLogService.recordImpersonationAction(
        principal, "impersonation.stop", targetTenantId, null);
    return authService.issueSessionTokens(user, null, principal);
  }

  private static void assertCanImpersonate(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    if (!principal.roleCodes().contains(PLATFORM_ADMIN)) {
      throw AuthException.forbidden("Platform admin required");
    }
  }
}

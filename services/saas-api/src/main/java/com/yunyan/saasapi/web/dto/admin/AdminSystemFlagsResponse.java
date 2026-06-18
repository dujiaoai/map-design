package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminSystemFlagsResponse(
    RegistrationFlags registration,
    AuthFlags auth,
    MailFlags mail,
    RateLimitFlags rateLimit,
    TenantRlsFlags tenantRls,
    BillingFlags billing,
    MfaFlags mfa,
    OidcFlags oidc,
    AuditFlags audit,
    RuntimeFlags runtime) {

  public record RegistrationFlags(
      boolean allowPublicOrgSignup,
      boolean allowPublicPersonalSignup,
      String registrationTokenTtl) {}

  public record AuthFlags(boolean passwordStrengthEnabled) {}

  public record MailFlags(boolean enabled, String fromAddress, boolean outboundReady) {}

  public record RateLimitFlags(
      boolean enabled, int loginIpMaxAttempts, int loginAccountMaxAttempts) {}

  public record TenantRlsFlags(boolean enabled) {}

  public record BillingFlags(
      boolean integrationEnabled, String baseUrl, boolean membershipPushEnabled) {}

  public record MfaFlags(
      boolean enforcementEnabled,
      boolean totpEnrollmentAvailable,
      int enrolledPlatformAdminCount) {}

  public record OidcFlags(
      boolean enabled,
      boolean authorizationCodeFlowAvailable,
      int configuredProviderCount) {}

  public record AuditFlags(
      boolean webhookEnabled,
      boolean webhookConfigured,
      String webhookFormat,
      String deliveryMode) {}

  public record RuntimeFlags(List<String> activeProfiles, int jwtPermEpoch) {}
}

package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminSystemFlagsResponse(
    RegistrationFlags registration,
    AuthFlags auth,
    MailFlags mail,
    RateLimitFlags rateLimit,
    TenantRlsFlags tenantRls,
    BillingFlags billing,
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

  public record RuntimeFlags(List<String> activeProfiles, int jwtPermEpoch) {}
}

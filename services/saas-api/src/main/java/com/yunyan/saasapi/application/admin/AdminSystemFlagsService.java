package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.BillingApiProperties;
import com.yunyan.saasapi.config.JwtProperties;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.config.TenantRlsProperties;
import com.yunyan.saasapi.web.dto.admin.AdminSystemFlagsResponse;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminSystemFlagsService {

  private final SaasAppProperties saasAppProperties;
  private final TenantRlsProperties tenantRlsProperties;
  private final BillingApiProperties billingApiProperties;
  private final JwtProperties jwtProperties;
  private final Environment environment;
  private final AdminMfaService adminMfaService;

  public AdminSystemFlagsResponse getFlags() {
    var mail = saasAppProperties.getMail();
    var registration = saasAppProperties.getRegistration();
    var rateLimit = saasAppProperties.getRateLimit();
    var membershipSync = billingApiProperties.getMembershipSync();

    return new AdminSystemFlagsResponse(
        new AdminSystemFlagsResponse.RegistrationFlags(
            registration.isAllowPublicOrgSignup(),
            registration.isAllowPublicPersonalSignup(),
            registration.getTokenTtl().toString()),
        new AdminSystemFlagsResponse.AuthFlags(
            saasAppProperties.getAuth().getPassword().isStrengthEnabled()),
        new AdminSystemFlagsResponse.MailFlags(
            mail.isEnabled(),
            mail.getFrom(),
            mail.isEnabled() && StringUtils.hasText(mail.getFrom())),
        new AdminSystemFlagsResponse.RateLimitFlags(
            rateLimit.isEnabled(),
            rateLimit.getLogin().getIpMaxAttempts(),
            rateLimit.getLogin().getAccountMaxAttempts()),
        new AdminSystemFlagsResponse.TenantRlsFlags(tenantRlsProperties.enabled()),
        new AdminSystemFlagsResponse.BillingFlags(
            billingApiProperties.isEnabled(),
            billingApiProperties.getBaseUrl(),
            membershipSync.isPushEnabled()),
        new AdminSystemFlagsResponse.MfaFlags(
            saasAppProperties.getAuth().getAdminMfa().isEnforcementEnabled(),
            true,
            adminMfaService.countEnrolledPlatformAdmins()),
        new AdminSystemFlagsResponse.RuntimeFlags(activeProfiles(), jwtProperties.effectivePermEpoch()));
  }

  private List<String> activeProfiles() {
    var profiles = environment.getActiveProfiles();
    if (profiles.length == 0) {
      return List.of("default");
    }
    return Arrays.asList(profiles);
  }
}

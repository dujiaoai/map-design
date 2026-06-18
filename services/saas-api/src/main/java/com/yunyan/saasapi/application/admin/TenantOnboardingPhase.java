package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.entity.SysTenant;
import java.time.Instant;

public final class TenantOnboardingPhase {

  public static final String ACTIVE = "active";
  public static final String TRIAL = "trial";
  public static final String TRIAL_EXPIRED = "trial_expired";
  public static final String SUSPENDED = "suspended";

  private TenantOnboardingPhase() {}

  public static String resolve(SysTenant tenant) {
    return resolve(tenant.getStatus(), tenant.getTrialEndsAt(), Instant.now());
  }

  public static String resolve(String status, Instant trialEndsAt, Instant now) {
    if (status != null && SUSPENDED.equalsIgnoreCase(status.trim())) {
      return SUSPENDED;
    }
    if (trialEndsAt != null) {
      return trialEndsAt.isAfter(now) ? TRIAL : TRIAL_EXPIRED;
    }
    return ACTIVE;
  }
}

package com.yunyan.saasapi.application.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.Test;

class TenantOnboardingPhaseTest {

  @Test
  void resolvesSuspendedTrialAndActive() {
    var now = Instant.parse("2026-06-18T00:00:00Z");
    assertEquals(
        TenantOnboardingPhase.SUSPENDED,
        TenantOnboardingPhase.resolve("suspended", now.plus(1, ChronoUnit.DAYS), now));
    assertEquals(
        TenantOnboardingPhase.TRIAL,
        TenantOnboardingPhase.resolve("active", now.plus(1, ChronoUnit.DAYS), now));
    assertEquals(
        TenantOnboardingPhase.TRIAL_EXPIRED,
        TenantOnboardingPhase.resolve("active", now.minus(1, ChronoUnit.DAYS), now));
    assertEquals(TenantOnboardingPhase.ACTIVE, TenantOnboardingPhase.resolve("active", null, now));
  }
}

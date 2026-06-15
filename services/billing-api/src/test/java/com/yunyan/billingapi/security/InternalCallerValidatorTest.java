package com.yunyan.billingapi.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.billingapi.config.BillingAppProperties;
import org.junit.jupiter.api.Test;

class InternalCallerValidatorTest {

  @Test
  void isCallerAllowed_emptyAllowlist_acceptsAnyCaller() {
    var properties = new BillingAppProperties();
    properties.getInternal().setAllowedCallers(java.util.List.of());

    assertThat(InternalCallerValidator.isCallerAllowed(properties, null)).isTrue();
    assertThat(InternalCallerValidator.isCallerAllowed(properties, "unknown")).isTrue();
  }

  @Test
  void isCallerAllowed_configuredAllowlist_requiresMatch() {
    var properties = new BillingAppProperties();
    properties.getInternal().setAllowedCallers(java.util.List.of("saas-api"));

    assertThat(InternalCallerValidator.isCallerAllowed(properties, "saas-api")).isTrue();
    assertThat(InternalCallerValidator.isCallerAllowed(properties, "  saas-api  ")).isTrue();
    assertThat(InternalCallerValidator.isCallerAllowed(properties, null)).isFalse();
    assertThat(InternalCallerValidator.isCallerAllowed(properties, "other-service")).isFalse();
  }
}

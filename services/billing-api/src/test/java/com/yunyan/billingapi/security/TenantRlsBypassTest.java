package com.yunyan.billingapi.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TenantRlsBypassTest {

  @Test
  void call_restoresPreviousState() {
    assertThat(TenantRlsBypass.isActive()).isFalse();
    TenantRlsBypass.run(
        () -> {
          assertThat(TenantRlsBypass.isActive()).isTrue();
        });
    assertThat(TenantRlsBypass.isActive()).isFalse();
  }
}

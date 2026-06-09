package com.yunyan.saasapi.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class TenantRlsBypassTest {

  @AfterEach
  void tearDown() {
    TenantContext.clear();
  }

  @Test
  void call_enablesBypassForNestedAction() {
    assertThat(TenantRlsBypass.isActive()).isFalse();
    var result =
        TenantRlsBypass.call(
            () -> {
              assertThat(TenantRlsBypass.isActive()).isTrue();
              return "ok";
            });
    assertThat(result).isEqualTo("ok");
    assertThat(TenantRlsBypass.isActive()).isFalse();
  }

  @Test
  void withTenant_setsTenantForScopedAction() {
    TenantContext.withTenant(
        "22222222-2222-2222-2222-222222222201",
        () -> assertThat(TenantContext.get())
            .isEqualTo("22222222-2222-2222-2222-222222222201"));
    assertThat(TenantContext.get()).isNull();
  }
}

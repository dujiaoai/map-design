package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AuditWebhookSmartRetryPolicyTest {

  @Test
  void nextRetryAt_increasesWithAttempts() {
    var policy = new AuditWebhookSmartRetryPolicy();
    var first = policy.nextRetryAt(1, 60_000L);
    var second = policy.nextRetryAt(3, 60_000L);
    assertThat(second).isAfter(first);
  }
}

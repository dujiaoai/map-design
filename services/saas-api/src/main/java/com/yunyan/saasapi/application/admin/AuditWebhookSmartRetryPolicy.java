package com.yunyan.saasapi.application.admin;

import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditWebhookSmartRetryPolicy {

  public Instant nextRetryAt(int attempts, long baseIntervalMs) {
    var multiplier = Math.max(attempts, 1);
    var capped = Math.min(multiplier, 6);
    var base = Math.max(baseIntervalMs, 1000L);
    var exponential = base * (1L << (capped - 1));
    var jitter = (long) (exponential * (0.1 * Math.random()));
    return Instant.now().plus(Duration.ofMillis(exponential + jitter));
  }
}

package com.yunyan.saasapi.infrastructure.billing;

import java.util.function.Supplier;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;

final class BillingHttpRetry {

  private BillingHttpRetry() {}

  static <T> T execute(int maxAttempts, long backoffMs, Supplier<T> action) {
    if (maxAttempts < 1) {
      throw new IllegalArgumentException("maxAttempts must be >= 1");
    }

    RuntimeException last = null;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return action.get();
      } catch (HttpStatusCodeException ex) {
        last = ex;
        if (!isRetryableStatus(ex.getStatusCode().value()) || attempt == maxAttempts) {
          throw ex;
        }
      } catch (RestClientException ex) {
        last = ex;
        if (attempt == maxAttempts) {
          throw ex;
        }
      }

      sleep(backoffMs * attempt);
    }

    throw last != null ? last : new IllegalStateException("Billing call failed");
  }

  static void executeVoid(int maxAttempts, long backoffMs, Runnable action) {
    execute(
        maxAttempts,
        backoffMs,
        () -> {
          action.run();
          return null;
        });
  }

  static boolean isRetryableStatus(int status) {
    return status == 502 || status == 503 || status == 504;
  }

  private static void sleep(long backoffMs) {
    if (backoffMs <= 0) {
      return;
    }
    try {
      Thread.sleep(backoffMs);
    } catch (InterruptedException interrupted) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Billing retry interrupted", interrupted);
    }
  }
}

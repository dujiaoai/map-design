package com.yunyan.billingapi.security.ratelimit;

import java.time.Duration;
import org.springframework.http.HttpStatus;

public class RateLimitException extends RuntimeException {

  private final Duration retryAfter;

  public RateLimitException(Duration retryAfter, String message) {
    super(message);
    this.retryAfter = retryAfter;
  }

  public static RateLimitException exceeded(Duration retryAfter, String message) {
    return new RateLimitException(retryAfter, message);
  }

  public Duration getRetryAfter() {
    return retryAfter;
  }

  public HttpStatus getStatus() {
    return HttpStatus.TOO_MANY_REQUESTS;
  }
}

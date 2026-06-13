package com.yunyan.saasapi.security.ratelimit;

import java.time.Duration;
import lombok.Getter;

@Getter
public class RateLimitException extends RuntimeException {

  private final Duration retryAfter;

  public RateLimitException(Duration retryAfter, String message) {
    super(message);
    this.retryAfter = retryAfter;
  }

  public static RateLimitException exceeded(Duration retryAfter, String message) {
    return new RateLimitException(retryAfter, message);
  }
}

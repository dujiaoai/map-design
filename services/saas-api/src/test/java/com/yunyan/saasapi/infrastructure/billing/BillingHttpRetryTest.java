package com.yunyan.saasapi.infrastructure.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

class BillingHttpRetryTest {

  @Test
  void execute_retriesTransientHttpStatus_thenSucceeds() {
    var attempts = new AtomicInteger();

    Supplier<String> action =
        () -> {
          if (attempts.incrementAndGet() < 3) {
            throw new HttpServerErrorException(HttpStatus.BAD_GATEWAY);
          }
          return "ok";
        };

    var result = BillingHttpRetry.execute(3, 0, action);

    assertThat(result).isEqualTo("ok");
    assertThat(attempts.get()).isEqualTo(3);
  }

  @Test
  void execute_doesNotRetryClientErrors() {
    var attempts = new AtomicInteger();

    assertThatThrownBy(
            () ->
                BillingHttpRetry.execute(
                    3,
                    0,
                    () -> {
                      attempts.incrementAndGet();
                      throw new HttpServerErrorException(HttpStatus.BAD_REQUEST);
                    }))
        .isInstanceOf(HttpServerErrorException.class);

    assertThat(attempts.get()).isEqualTo(1);
  }

  @Test
  void execute_retriesRestClientException() {
    var attempts = new AtomicInteger();

    var result =
        BillingHttpRetry.execute(
            2,
            0,
            () -> {
              if (attempts.incrementAndGet() == 1) {
                throw new ResourceAccessException("connection reset");
              }
              return 42;
            });

    assertThat(result).isEqualTo(42);
    assertThat(attempts.get()).isEqualTo(2);
  }
}

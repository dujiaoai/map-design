package com.yunyan.billingapi.application.payment.provider;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PaymentProviderModeTest {

  @Test
  void fromConfig_parsesStubAndLive() {
    assertThat(PaymentProviderMode.fromConfig(null)).isEqualTo(PaymentProviderMode.STUB);
    assertThat(PaymentProviderMode.fromConfig("stub")).isEqualTo(PaymentProviderMode.STUB);
    assertThat(PaymentProviderMode.fromConfig("live")).isEqualTo(PaymentProviderMode.LIVE);
    assertThat(PaymentProviderMode.fromConfig("production")).isEqualTo(PaymentProviderMode.LIVE);
  }
}

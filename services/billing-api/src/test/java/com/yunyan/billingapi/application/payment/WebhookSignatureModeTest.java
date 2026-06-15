package com.yunyan.billingapi.application.payment;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class WebhookSignatureModeTest {

  @Test
  void fromConfig_parsesProviderModes() {
    assertThat(WebhookSignatureMode.fromConfig("hmac")).isEqualTo(WebhookSignatureMode.HMAC);
    assertThat(WebhookSignatureMode.fromConfig("wechat_v3")).isEqualTo(WebhookSignatureMode.WECHAT_V3);
    assertThat(WebhookSignatureMode.fromConfig("wechat-v3")).isEqualTo(WebhookSignatureMode.WECHAT_V3);
    assertThat(WebhookSignatureMode.fromConfig("alipay_rsa")).isEqualTo(WebhookSignatureMode.ALIPAY_RSA);
  }

  @Test
  void fromConfig_defaultsToHmac() {
    assertThat(WebhookSignatureMode.fromConfig(null)).isEqualTo(WebhookSignatureMode.HMAC);
    assertThat(WebhookSignatureMode.fromConfig("unknown")).isEqualTo(WebhookSignatureMode.HMAC);
  }
}

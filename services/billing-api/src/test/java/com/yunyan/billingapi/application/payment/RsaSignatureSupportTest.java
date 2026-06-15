package com.yunyan.billingapi.application.payment;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.billingapi.BillingWebhookRsaTestSupport;
import java.security.KeyPair;
import org.junit.jupiter.api.Test;

class RsaSignatureSupportTest {

  private static final KeyPair KEY_PAIR = BillingWebhookRsaTestSupport.generateRsaKeyPair();

  @Test
  void signAndVerify_roundTrip() {
    var message = "hello webhook";
    var signature =
        RsaSignatureSupport.signSha256Rsa(KEY_PAIR.getPrivate(), message);
    assertThat(
            RsaSignatureSupport.verifySha256Rsa(KEY_PAIR.getPublic(), message, signature))
        .isTrue();
  }

  @Test
  void verify_rejectsTamperedMessage() {
    var message = "payload";
    var signature =
        RsaSignatureSupport.signSha256Rsa(KEY_PAIR.getPrivate(), message);
    assertThat(
            RsaSignatureSupport.verifySha256Rsa(
                KEY_PAIR.getPublic(), "tampered", signature))
        .isFalse();
  }
}

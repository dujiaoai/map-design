package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AuditWebhookHmacSignerTest {

  private final AuditWebhookHmacSigner signer = new AuditWebhookHmacSigner();

  @Test
  void sign_emptySecret_returnsEmptyString() {
    assertThat(signer.sign("", "{\"events\":[]}")).isEmpty();
    assertThat(signer.sign("  ", "{\"events\":[]}")).isEmpty();
  }

  @Test
  void sign_knownPayload_returnsDeterministicHex() {
    var signature = signer.sign("test-secret", "{\"events\":[]}");
    assertThat(signature).hasSize(64).matches("[0-9a-f]+");
    assertThat(signer.sign("test-secret", "{\"events\":[]}")).isEqualTo(signature);
  }

  @Test
  void sign_differentPayload_changesSignature() {
    var first = signer.sign("test-secret", "{\"events\":[]}");
    var second = signer.sign("test-secret", "{\"events\":[1]}");
    assertThat(first).isNotEqualTo(second);
  }
}

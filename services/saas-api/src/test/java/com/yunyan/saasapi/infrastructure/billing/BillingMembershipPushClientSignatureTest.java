package com.yunyan.saasapi.infrastructure.billing;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BillingMembershipPushClientSignatureTest {

  @Test
  void signHmacSha256Hex_isDeterministic() {
    var signature =
        BillingMembershipPushClient.signHmacSha256Hex(
            "test-secret", "{\"items\":[{\"id\":\"1\",\"eventType\":\"user_upsert\",\"payload\":\"{}\"}]}");
    assertThat(signature).isNotBlank();
    assertThat(
            BillingMembershipPushClient.signHmacSha256Hex(
                "test-secret",
                "{\"items\":[{\"id\":\"1\",\"eventType\":\"user_upsert\",\"payload\":\"{}\"}]}"))
        .isEqualTo(signature);
  }
}

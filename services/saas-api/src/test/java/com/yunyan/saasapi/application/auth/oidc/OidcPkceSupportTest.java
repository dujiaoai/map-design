package com.yunyan.saasapi.application.auth.oidc;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class OidcPkceSupportTest {

  private final OidcPkceSupport support = new OidcPkceSupport();

  @Test
  void codeChallengeS256_isDeterministicAndUrlSafe() {
    var verifier = "test-verifier-value";
    var challenge = support.codeChallengeS256(verifier);

    assertTrue(challenge.matches("[A-Za-z0-9_-]+"));
    assertNotEquals(verifier, challenge);
    assertEqualsRepeated(verifier, challenge);
  }

  private void assertEqualsRepeated(String verifier, String challenge) {
    org.junit.jupiter.api.Assertions.assertEquals(challenge, support.codeChallengeS256(verifier));
  }
}

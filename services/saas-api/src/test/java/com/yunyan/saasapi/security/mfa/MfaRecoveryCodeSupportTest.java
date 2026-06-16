package com.yunyan.saasapi.security.mfa;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class MfaRecoveryCodeSupportTest {

  private final MfaRecoveryCodeSupport support = new MfaRecoveryCodeSupport();

  @Test
  void generateCodes_returnsTenFormattedCodes() {
    var codes = support.generateCodes();
    assertEquals(10, codes.size());
    for (var code : codes) {
      assertTrue(code.matches("[A-Z2-9]{4}-[A-Z2-9]{4}"));
    }
  }

  @Test
  void normalize_stripsDashAndSpaces() {
    assertEquals("ABCD2345", support.normalize(" abcd-2345 "));
  }

  @Test
  void looksLikeRecoveryCode_acceptsNormalizedEightChars() {
    assertTrue(support.looksLikeRecoveryCode("ABCD-2345"));
  }
}

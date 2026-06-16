package com.yunyan.saasapi.security.mfa;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class TotpSupportTest {

  private final TotpSupport totpSupport = new TotpSupport(new com.yunyan.saasapi.config.SaasAppProperties());

  @Test
  void generatedCodeMatchesVerifier() {
    var secret = totpSupport.generateSecret();
    var code = totpSupport.currentCode(secret);
    assertTrue(totpSupport.verifyCode(secret, code));
  }
}

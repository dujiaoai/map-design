package com.yunyan.saasapi.application.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.yunyan.saasapi.security.AuthException;
import org.junit.jupiter.api.Test;

class PhoneValidatorTest {

  @Test
  void normalizeOptional_blank_returnsNull() {
    assertNull(PhoneValidator.normalizeOptional(null));
    assertNull(PhoneValidator.normalizeOptional(""));
    assertNull(PhoneValidator.normalizeOptional("   "));
  }

  @Test
  void normalizeOptional_validCnMobile_returnsTrimmed() {
    assertEquals("13800138000", PhoneValidator.normalizeOptional("13800138000"));
  }

  @Test
  void normalizeOptional_invalid_throwsBadRequest() {
    assertThrows(AuthException.class, () -> PhoneValidator.normalizeOptional("12345"));
  }
}

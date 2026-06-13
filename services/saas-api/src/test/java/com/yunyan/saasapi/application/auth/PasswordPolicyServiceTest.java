package com.yunyan.saasapi.application.auth;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.security.AuthException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PasswordPolicyServiceTest {

  SaasAppProperties properties;
  PasswordPolicyService service;

  @BeforeEach
  void setUp() {
    properties = new SaasAppProperties();
    service = new PasswordPolicyService(properties);
  }

  @Test
  void validateNewPassword_whenDisabled_allowsSimplePassword() {
    properties.getAuth().getPassword().setStrengthEnabled(false);
    assertDoesNotThrow(() -> service.validateNewPassword("password"));
  }

  @Test
  void validateNewPassword_whenEnabled_rejectsWeakPassword() {
    properties.getAuth().getPassword().setStrengthEnabled(true);
    assertThrows(AuthException.class, () -> service.validateNewPassword("password"));
  }

  @Test
  void validateNewPassword_whenEnabled_acceptsStrongPassword() {
    properties.getAuth().getPassword().setStrengthEnabled(true);
    assertDoesNotThrow(() -> service.validateNewPassword("Password1"));
  }
}

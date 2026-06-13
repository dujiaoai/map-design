package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.security.AuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PasswordPolicyService {

  static final String WEAK_PASSWORD_MESSAGE =
      "Password must be at least 8 characters and contain uppercase, lowercase, and a digit";

  private final SaasAppProperties saasAppProperties;

  public void validateNewPassword(String password) {
    if (!saasAppProperties.getAuth().getPassword().isStrengthEnabled()) {
      return;
    }
    if (!StringUtils.hasText(password) || password.length() < 8) {
      throw AuthException.badRequest(WEAK_PASSWORD_MESSAGE);
    }
    var hasUpper = false;
    var hasLower = false;
    var hasDigit = false;
    for (var ch : password.toCharArray()) {
      if (Character.isUpperCase(ch)) {
        hasUpper = true;
      } else if (Character.isLowerCase(ch)) {
        hasLower = true;
      } else if (Character.isDigit(ch)) {
        hasDigit = true;
      }
    }
    if (!hasUpper || !hasLower || !hasDigit) {
      throw AuthException.badRequest(WEAK_PASSWORD_MESSAGE);
    }
  }
}

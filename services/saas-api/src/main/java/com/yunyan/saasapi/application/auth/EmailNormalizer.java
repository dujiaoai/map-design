package com.yunyan.saasapi.application.auth;

import java.util.Locale;
import org.springframework.util.StringUtils;

public final class EmailNormalizer {

  private EmailNormalizer() {}

  public static String normalize(String email) {
    if (!StringUtils.hasText(email)) {
      return email;
    }
    return email.trim().toLowerCase(Locale.ROOT);
  }
}

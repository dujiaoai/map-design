package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.security.AuthException;
import java.util.regex.Pattern;
import org.springframework.util.StringUtils;

/** 用户资料手机号校验（中国大陆 11 位手机号）。 */
public final class PhoneValidator {

  private static final Pattern CN_MOBILE = Pattern.compile("^1[3-9]\\d{9}$");
  private static final String INVALID_MESSAGE = "Invalid phone number format";

  private PhoneValidator() {}

  /** @return 规范化后的手机号，或 null（空字符串视为清除） */
  public static String normalizeOptional(String phone) {
    if (phone == null) {
      return null;
    }
    var trimmed = phone.trim();
    if (trimmed.isEmpty()) {
      return null;
    }
    if (!CN_MOBILE.matcher(trimmed).matches()) {
      throw AuthException.badRequest(INVALID_MESSAGE);
    }
    return trimmed;
  }

  public static boolean isValid(String phone) {
    return StringUtils.hasText(phone) && CN_MOBILE.matcher(phone.trim()).matches();
  }
}

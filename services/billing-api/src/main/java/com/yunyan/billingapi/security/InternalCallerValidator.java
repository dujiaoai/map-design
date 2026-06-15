package com.yunyan.billingapi.security;

import com.yunyan.billingapi.config.BillingAppProperties;
import java.util.List;
import org.springframework.util.StringUtils;

final class InternalCallerValidator {

  private InternalCallerValidator() {}

  static boolean isCallerAllowed(BillingAppProperties billingAppProperties, String callerHeader) {
    var allowed = billingAppProperties.getInternal().getAllowedCallers();
    if (allowed == null || allowed.isEmpty()) {
      return true;
    }
    if (!StringUtils.hasText(callerHeader)) {
      return false;
    }
    var normalized = callerHeader.trim();
    return allowed.stream().anyMatch(entry -> entry.equals(normalized));
  }

  static List<String> allowedCallers(BillingAppProperties billingAppProperties) {
    var allowed = billingAppProperties.getInternal().getAllowedCallers();
    return allowed != null ? allowed : List.of();
  }
}

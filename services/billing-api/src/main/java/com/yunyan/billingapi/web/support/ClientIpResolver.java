package com.yunyan.billingapi.web.support;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

public final class ClientIpResolver {

  private ClientIpResolver() {}

  public static String resolve(HttpServletRequest request) {
    var forwarded = request.getHeader("X-Forwarded-For");
    if (StringUtils.hasText(forwarded)) {
      return forwarded.split(",")[0].trim();
    }
    var realIp = request.getHeader("X-Real-IP");
    if (StringUtils.hasText(realIp)) {
      return realIp.trim();
    }
    var remote = request.getRemoteAddr();
    return StringUtils.hasText(remote) ? remote.trim() : "unknown";
  }
}

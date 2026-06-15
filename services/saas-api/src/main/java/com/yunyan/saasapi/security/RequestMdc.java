package com.yunyan.saasapi.security;

import java.util.UUID;
import org.slf4j.MDC;

final class RequestMdc {

  static final String TENANT_ID = "tenantId";
  static final String USER_ID = "userId";

  private RequestMdc() {}

  static void set(UUID tenantId, UUID userId) {
    if (tenantId != null) {
      MDC.put(TENANT_ID, tenantId.toString());
    }
    if (userId != null) {
      MDC.put(USER_ID, userId.toString());
    }
  }

  static void clear() {
    MDC.remove(TENANT_ID);
    MDC.remove(USER_ID);
  }
}

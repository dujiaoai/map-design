package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.web.dto.scim.ScimBulkOperationResult;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ScimBulkIdempotencyCache {

  private final Map<String, ScimBulkOperationResult> cache = new ConcurrentHashMap<>();

  public ScimBulkOperationResult get(UUID tenantId, String bulkId) {
    if (!StringUtils.hasText(bulkId)) {
      return null;
    }
    return cache.get(key(tenantId, bulkId));
  }

  public void put(UUID tenantId, String bulkId, ScimBulkOperationResult result) {
    if (!StringUtils.hasText(bulkId) || result == null) {
      return;
    }
    cache.put(key(tenantId, bulkId), result);
  }

  private static String key(UUID tenantId, String bulkId) {
    return tenantId + ":" + bulkId.trim();
  }
}

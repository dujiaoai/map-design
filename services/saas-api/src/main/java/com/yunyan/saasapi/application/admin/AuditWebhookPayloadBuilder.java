package com.yunyan.saasapi.application.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditWebhookPayloadBuilder {

  private final ObjectMapper objectMapper;

  public String buildBatchPayload(String format, List<SysAdminAuditLog> logs) {
    if ("ndjson".equalsIgnoreCase(format)) {
      var lines =
          logs.stream()
              .map(this::toEventMap)
              .map(this::writeLine)
              .reduce(new StringBuilder(), StringBuilder::append, StringBuilder::append);
      return lines.toString();
    }
    try {
      return objectMapper.writeValueAsString(
          Map.of("type", "audit.batch", "format", format, "events", logs.stream().map(this::toEventMap).toList()));
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to serialize audit webhook batch", ex);
    }
  }

  public String buildSingleEventPayload(SysAdminAuditLog log) {
    return writeLine(toEventMap(log));
  }

  private Map<String, Object> toEventMap(SysAdminAuditLog log) {
    return Map.of(
        "id", log.getId().toString(),
        "action", log.getAction(),
        "actorEmail", log.getActorEmail(),
        "resourceType", log.getResourceType(),
        "resourceId", log.getResourceId() == null ? "" : log.getResourceId(),
        "targetTenantId", log.getTargetTenantId() == null ? "" : log.getTargetTenantId().toString(),
        "crossTenant", log.isCrossTenant(),
        "detail", log.getDetail() == null ? "" : log.getDetail(),
        "createdAt", log.getCreatedAt().toString());
  }

  private String writeLine(Map<String, Object> event) {
    try {
      return objectMapper.writeValueAsString(event) + "\n";
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to serialize audit event", ex);
    }
  }
}

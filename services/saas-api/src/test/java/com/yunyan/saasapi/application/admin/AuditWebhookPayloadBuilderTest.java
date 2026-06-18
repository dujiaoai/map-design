package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AuditWebhookPayloadBuilderTest {

  private final AuditWebhookPayloadBuilder builder = new AuditWebhookPayloadBuilder(new ObjectMapper());

  @Test
  void buildBatchPayload_jsonl_wrapsEventsArray() throws Exception {
    var log = sampleLog();
    var json = builder.buildBatchPayload("jsonl", List.of(log));
    assertThat(json).contains("\"type\":\"audit.batch\"");
    assertThat(json).contains(log.getAction());
  }

  @Test
  void buildBatchPayload_ndjson_emitsLines() {
    var payload = builder.buildBatchPayload("ndjson", List.of(sampleLog()));
    assertThat(payload.trim()).contains("\"action\":\"tenant.update\"");
    assertThat(payload).endsWith("\n");
  }

  private static SysAdminAuditLog sampleLog() {
    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(UUID.randomUUID());
    log.setActorEmail("admin@test.local");
    log.setAction("tenant.update");
    log.setResourceType("tenant");
    log.setCrossTenant(false);
    log.setCreatedAt(Instant.parse("2026-06-01T00:00:00Z"));
    return log;
  }
}

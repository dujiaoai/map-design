package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AdminAuditLogCsvExporterTest {

  @Test
  void toCsvBytes_escapesCommasAndQuotes() {
    var log = new SysAdminAuditLog();
    log.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
    log.setCreatedAt(Instant.parse("2026-06-15T08:00:00Z"));
    log.setActorEmail("ops@demo.local");
    log.setActorUserId(UUID.fromString("33333333-3333-3333-3333-333333333333"));
    log.setAction("billing.wallet.adjust");
    log.setResourceType("billing_wallet");
    log.setResourceId("wallet-1");
    log.setTargetTenantId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
    log.setCrossTenant(true);
    log.setDetail("note with \"quotes\", comma");

    var csv = new String(AdminAuditLogCsvExporter.toCsvBytes(List.of(log)), StandardCharsets.UTF_8);

    assertThat(csv).startsWith("\uFEFF");
    assertThat(csv).contains("ops@demo.local");
    assertThat(csv).contains("33333333-3333-3333-3333-333333333333");
    assertThat(csv).contains("\"note with \"\"quotes\"\", comma\"");
  }
}

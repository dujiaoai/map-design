package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

final class AdminAuditLogCsvExporter {

  private static final byte[] UTF8_BOM = new byte[] {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};

  private AdminAuditLogCsvExporter() {}

  static byte[] toCsvBytes(List<SysAdminAuditLog> logs) {
    var builder = new StringBuilder();
    builder.append(
        "id,created_at,actor_user_id,actor_email,action,resource_type,resource_id,target_tenant_id,cross_tenant,detail\n");
    for (var log : logs) {
      builder
          .append(csvCell(log.getId() == null ? null : log.getId().toString()))
          .append(',')
          .append(csvCell(formatInstant(log.getCreatedAt())))
          .append(',')
          .append(
              csvCell(log.getActorUserId() == null ? null : log.getActorUserId().toString()))
          .append(',')
          .append(csvCell(log.getActorEmail()))
          .append(',')
          .append(csvCell(log.getAction()))
          .append(',')
          .append(csvCell(log.getResourceType()))
          .append(',')
          .append(csvCell(log.getResourceId()))
          .append(',')
          .append(
              csvCell(
                  log.getTargetTenantId() == null ? null : log.getTargetTenantId().toString()))
          .append(',')
          .append(log.isCrossTenant())
          .append(',')
          .append(csvCell(log.getDetail()))
          .append('\n');
    }

    var body = builder.toString().getBytes(StandardCharsets.UTF_8);
    var combined = new byte[UTF8_BOM.length + body.length];
    System.arraycopy(UTF8_BOM, 0, combined, 0, UTF8_BOM.length);
    System.arraycopy(body, 0, combined, UTF8_BOM.length, body.length);
    return combined;
  }

  private static String formatInstant(Instant instant) {
    return instant == null ? "" : instant.toString();
  }

  private static String csvCell(String value) {
    if (value == null) {
      return "";
    }
    var escaped = value.replace("\"", "\"\"");
    if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n") || escaped.contains("\r")) {
      return "\"" + escaped + "\"";
    }
    return escaped;
  }
}

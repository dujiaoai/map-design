package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import java.nio.charset.StandardCharsets;
import java.util.List;

final class AdminUsageTrendsCsvExporter {

  private AdminUsageTrendsCsvExporter() {}

  static byte[] toCsvBytes(List<AdminUsageDayBucket> days) {
    var sb = new StringBuilder();
    sb.append("date,newUsers,auditEvents,activeTenants,billingApiCallsPerDay,billingReconcileDiffsPerDay\n");
    for (var day : days) {
      sb.append(day.date())
          .append(',')
          .append(day.newUsers())
          .append(',')
          .append(day.auditEvents())
          .append(',')
          .append(day.activeTenants())
          .append(',')
          .append(day.billingApiCallsPerDay())
          .append(',')
          .append(day.billingReconcileDiffsPerDay())
          .append('\n');
    }
    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }
}

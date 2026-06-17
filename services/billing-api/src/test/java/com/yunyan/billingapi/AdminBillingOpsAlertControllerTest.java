package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yunyan.billingapi.application.ops.BillingOpsAlertService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.web.dto.AdminReconciliationDailyResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminBillingOpsAlertControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired BillingOpsAlertService opsAlertService;

  @Autowired JdbcTemplate jdbcTemplate;

  private UUID alertId;

  @BeforeEach
  void seedOpenAlert() {
    jdbcTemplate.update("DELETE FROM billing_ops_alert");
    var date = LocalDate.parse("2026-06-10");
    var report =
        new AdminReconciliationDailyResponse(
            date,
            Instant.parse("2026-06-10T00:00:00Z"),
            Instant.parse("2026-06-11T00:00:00Z"),
            1,
            500,
            4900,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            false,
            List.of("paid_order_count_mismatch: orders=1 ledger=0"));
    opsAlertService.recordReconciliationUnbalanced(date, report);
    alertId =
        jdbcTemplate.queryForObject(
            "SELECT id FROM billing_ops_alert WHERE reference_key = ?",
            UUID.class,
            "reconciliation:2026-06-10");
  }

  @Test
  void listOpsAlerts_returnsOpenItems() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));

    mockMvc
        .perform(
            get("/v1/admin/billing/ops-alerts")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(1))
        .andExpect(jsonPath("$.items[0].alertType").value("reconciliation_daily"))
        .andExpect(jsonPath("$.items[0].resolvedAt").isEmpty());
  }

  @Test
  void resolveOpsAlert_marksResolved() throws Exception {
    var tenantId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId,
            tenantId,
            List.of(
                PermissionCodes.ADMIN_BILLING_READ, PermissionCodes.ADMIN_BILLING_ADJUST));

    mockMvc
        .perform(
            post("/v1/admin/billing/ops-alerts/" + alertId + "/resolve")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(alertId.toString()))
        .andExpect(jsonPath("$.idempotentReplay").value(false))
        .andExpect(jsonPath("$.resolvedAt").isNotEmpty());

    mockMvc
        .perform(
            get("/v1/admin/billing/ops-alerts")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(0));
  }

  @Test
  void resolveOpsAlert_withoutAdjustPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));

    mockMvc
        .perform(
            post("/v1/admin/billing/ops-alerts/" + alertId + "/resolve")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }
}

package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.admin.AdminAuditLogService;
import com.yunyan.billingapi.domain.mapper.SysAdminAuditLogMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminBillingControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired SysAdminAuditLogMapper auditLogMapper;

  @Test
  void adjustWallet_creditsUserWallet() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));
    var auditBefore = auditCount();

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "userId",
                            userId.toString(),
                            "amount",
                            200,
                            "remark",
                            "enterprise_prepay",
                            "idempotencyKey",
                            "admin-adjust:test-1"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.amount").value(200))
        .andExpect(jsonPath("$.balanceAfter").value(200))
        .andExpect(jsonPath("$.idempotentReplay").value(false));

    assertThat(auditCount() - auditBefore).isEqualTo(1);
  }

  @Test
  void adjustWallet_idempotentReplay_returnsSameLedgerWithoutDuplicateAudit() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));
    var body =
        Map.of(
            "userId",
            userId.toString(),
            "amount",
            150,
            "remark",
            "gift",
            "idempotencyKey",
            "admin-adjust:test-2");
    var auditBefore = auditCount();

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.amount").value(150))
        .andExpect(jsonPath("$.balanceAfter").value(150))
        .andExpect(jsonPath("$.idempotentReplay").value(true));

    assertThat(auditCount() - auditBefore).isEqualTo(1);
  }

  @Test
  void adjustWallet_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));
    var auditBefore = auditCount();

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "userId",
                            userId.toString(),
                            "amount",
                            100,
                            "remark",
                            "test",
                            "idempotencyKey",
                            "admin-adjust:denied"))))
        .andExpect(status().isForbidden());

    assertThat(auditCount() - auditBefore).isZero();
  }

  @Test
  void adjustWallet_debitBelowZero_returns409() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));
    var auditBefore = auditCount();

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "userId",
                            userId.toString(),
                            "amount",
                            -50,
                            "remark",
                            "correction",
                            "idempotencyKey",
                            "admin-adjust:debit-empty"))))
        .andExpect(status().isConflict());

    assertThat(auditCount() - auditBefore).isZero();
  }

  private long auditCount() {
    return auditLogMapper.countByAction(AdminAuditLogService.ACTION_BILLING_WALLET_ADJUST);
  }
}

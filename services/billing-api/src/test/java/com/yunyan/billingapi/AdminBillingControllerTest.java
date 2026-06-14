package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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

  @Test
  void adjustWallet_creditsUserWallet() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));

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
  }

  @Test
  void adjustWallet_idempotentReplay_returnsSameLedger() throws Exception {
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
  }

  @Test
  void adjustWallet_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

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
  }

  @Test
  void adjustWallet_debitBelowZero_returns409() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));

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
  }
}

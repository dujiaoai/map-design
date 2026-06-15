package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminBillingLedgerControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMembershipSchema() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
  }

  @Test
  void listLedger_returnsAdjustEntryForUser() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var adjustToken =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));
    var readToken =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));
    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, userId, "active");

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + adjustToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "userId",
                            userId.toString(),
                            "amount",
                            120,
                            "remark",
                            "ledger-test",
                            "idempotencyKey",
                            "admin-adjust:ledger-test-1"))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/admin/billing/tenants/{tenantId}/ledger", tenantId)
                .header("Authorization", "Bearer " + readToken)
                .param("userId", userId.toString())
                .param("entryType", "adjust"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(1))
        .andExpect(jsonPath("$.items[0].entryType").value("adjust"))
        .andExpect(jsonPath("$.items[0].amount").value(120))
        .andExpect(jsonPath("$.items[0].userId").value(userId.toString()))
        .andExpect(jsonPath("$.items[0].remark").value("ledger-test"));
  }

  @Test
  void listLedger_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(
            get("/v1/admin/billing/tenants/{tenantId}/ledger", tenantId)
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }
}

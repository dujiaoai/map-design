package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
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
class BillingWireTransferControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMembershipSchema() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
  }

  @Test
  void platformAccount_returnsConfiguredTestProfile() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var userToken =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_RECHARGE_CREATE));

    mockMvc
        .perform(
            get("/v1/billing/wire-transfers/platform-account")
                .header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enabled").value(true))
        .andExpect(jsonPath("$.accountName").value("云眼地图测试收款户"))
        .andExpect(jsonPath("$.bankName").value("中国银行深圳分行"))
        .andExpect(jsonPath("$.accountNo").value("6222021234567890123"))
        .andExpect(jsonPath("$.transferRemark").value("请在附言注明企业名称与申请单号"));
  }

  @Test
  void userSubmitsWireTransfer_adminApprovesOrRejects() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();

    var userToken =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ,
                PermissionCodes.BILLING_RECHARGE_CREATE));
    var adminReadToken =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));
    var adminAdjustToken =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));

    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, userId, "active");

    var createBody =
        mockMvc
            .perform(
                post("/v1/billing/wire-transfers")
                    .header("Authorization", "Bearer " + userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "companyName",
                                "示例科技有限公司",
                                "contactEmail",
                                "finance@example.com",
                                "amountCents",
                                100000,
                                "points",
                                10000,
                                "bankReference",
                                "20260615001"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("pending"))
            .andExpect(jsonPath("$.points").value(10000))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var requestId = objectMapper.readTree(createBody).get("id").asText();

    mockMvc
        .perform(
            get("/v1/billing/wire-transfers").header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(1));

    var walletBefore =
        mockMvc
            .perform(get("/v1/billing/wallet").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var balanceBefore = objectMapper.readTree(walletBefore).get("balance").asLong();

    mockMvc
        .perform(
            post("/v1/admin/billing/wire-transfers/" + requestId + "/approve")
                .header("Authorization", "Bearer " + adminAdjustToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("credited"))
        .andExpect(jsonPath("$.pointsCredited").value(10000))
        .andExpect(jsonPath("$.walletBalanceAfter").value(balanceBefore + 10000));

    mockMvc
        .perform(
            get("/v1/admin/billing/wire-transfers?status=credited")
                .header("Authorization", "Bearer " + adminReadToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(1));

    var createBody2 =
        mockMvc
            .perform(
                post("/v1/billing/wire-transfers")
                    .header("Authorization", "Bearer " + userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "companyName",
                                "示例科技有限公司",
                                "contactEmail",
                                "finance@example.com",
                                "amountCents",
                                50000,
                                "points",
                                5000))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var requestId2 = objectMapper.readTree(createBody2).get("id").asText();

    mockMvc
        .perform(
            post("/v1/admin/billing/wire-transfers/" + requestId2 + "/reject")
                .header("Authorization", "Bearer " + adminAdjustToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "汇款凭证不符"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("rejected"));

    assertThat(balanceBefore + 10000).isPositive();
  }
}

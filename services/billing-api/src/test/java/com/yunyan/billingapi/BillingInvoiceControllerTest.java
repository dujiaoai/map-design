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
class BillingInvoiceControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMembershipSchema() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
  }

  @Test
  void userCanRequestInvoiceForPaidOrder_adminCanIssueOrReject() throws Exception {
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

    var orderNo = createAndPayOrder(userToken);

    mockMvc
        .perform(
            post("/v1/billing/invoices")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "orderNo",
                            orderNo,
                            "invoiceType",
                            "personal",
                            "title",
                            "张三",
                            "email",
                            "user@example.com"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("pending"))
        .andExpect(jsonPath("$.orderNo").value(orderNo));

    mockMvc
        .perform(
            post("/v1/billing/invoices")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "orderNo",
                            orderNo,
                            "invoiceType",
                            "personal",
                            "title",
                            "张三",
                            "email",
                            "user@example.com"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("pending"));

    var adminList =
        mockMvc
            .perform(
                get("/v1/admin/billing/invoices?status=pending")
                    .header("Authorization", "Bearer " + adminReadToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var invoiceId = objectMapper.readTree(adminList).get("items").get(0).get("id").asText();

    mockMvc
        .perform(
            post("/v1/admin/billing/invoices/" + invoiceId + "/issue")
                .header("Authorization", "Bearer " + adminAdjustToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("issued"));

    var orderNo2 = createAndPayOrder(userToken);

    var createBody =
        mockMvc
            .perform(
                post("/v1/billing/invoices")
                    .header("Authorization", "Bearer " + userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "orderNo",
                                orderNo2,
                                "invoiceType",
                                "enterprise",
                                "title",
                                "示例公司",
                                "taxNo",
                                "91310000MA1FL1234X",
                                "email",
                                "finance@example.com"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var invoiceId2 = objectMapper.readTree(createBody).get("id").asText();
    assertThat(invoiceId2).isNotBlank();

    mockMvc
        .perform(
            post("/v1/admin/billing/invoices/" + invoiceId2 + "/reject")
                .header("Authorization", "Bearer " + adminAdjustToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "抬头信息有误"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("rejected"))
        .andExpect(jsonPath("$.adminRemark").value("抬头信息有误"));

    mockMvc
        .perform(
            get("/v1/billing/invoices").header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(2));
  }

  @Test
  void cannotRequestInvoiceForPendingOrder() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();

    var userToken =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ,
                PermissionCodes.BILLING_RECHARGE_CREATE));

    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, userId, "active");

    var createBody =
        mockMvc
            .perform(
                post("/v1/billing/recharge-orders")
                    .header("Authorization", "Bearer " + userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("packageCode", "starter_500", "channel", "mock"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var orderNo = objectMapper.readTree(createBody).get("orderNo").asText();

    mockMvc
        .perform(
            post("/v1/billing/invoices")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "orderNo",
                            orderNo,
                            "invoiceType",
                            "personal",
                            "title",
                            "张三",
                            "email",
                            "user@example.com"))))
        .andExpect(status().isBadRequest());
  }

  private String createAndPayOrder(String userToken) throws Exception {
    var createBody =
        mockMvc
            .perform(
                post("/v1/billing/recharge-orders")
                    .header("Authorization", "Bearer " + userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("packageCode", "starter_500", "channel", "mock"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var orderNo = objectMapper.readTree(createBody).get("orderNo").asText();

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders/" + orderNo + "/mock-pay")
                .header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk());

    return orderNo;
  }
}

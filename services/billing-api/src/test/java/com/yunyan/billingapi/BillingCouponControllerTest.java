package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
class BillingCouponControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMembershipSchema() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
  }

  @Test
  void adminCreatesCoupon_userRedeems_idempotentReplay() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var couponCode = "WELCOME100";

    var userToken =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));
    var adminWriteToken =
        BillingJwtTestSupport.accessToken(
            adminId,
            tenantId,
            List.of(
                PermissionCodes.ADMIN_BILLING_READ,
                PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE));

    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, userId, "active");

    mockMvc
        .perform(
            post("/v1/admin/billing/coupons")
                .header("Authorization", "Bearer " + adminWriteToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "code",
                            couponCode,
                            "points",
                            100,
                            "maxTotalRedemptions",
                            10,
                            "status",
                            "active"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(couponCode))
        .andExpect(jsonPath("$.points").value(100));

    mockMvc
        .perform(
            get("/v1/admin/billing/coupons")
                .header("Authorization", "Bearer " + adminWriteToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].code").value(couponCode));

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
            post("/v1/billing/coupons/redeem")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("code", couponCode))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.points").value(100))
        .andExpect(jsonPath("$.idempotentReplay").value(false))
        .andExpect(jsonPath("$.walletBalance").value(balanceBefore + 100));

    mockMvc
        .perform(
            post("/v1/billing/coupons/redeem")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("code", couponCode))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.idempotentReplay").value(true));

    mockMvc
        .perform(
            patch("/v1/admin/billing/coupons/" + couponCode)
                .header("Authorization", "Bearer " + adminWriteToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "inactive"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("inactive"));

    var otherUserId = UUID.randomUUID();
    var otherToken =
        BillingJwtTestSupport.accessToken(
            otherUserId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));
    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, otherUserId, "active");

    mockMvc
        .perform(
            post("/v1/billing/coupons/redeem")
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("code", couponCode))))
        .andExpect(status().isBadRequest());

    assertThat(balanceBefore + 100).isPositive();
  }
}

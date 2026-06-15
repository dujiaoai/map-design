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
class BillingRechargeCouponDiscountTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void discountCoupon_reducesRechargePriceAndRecordsRedemptionOnPay() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var couponCode = "SAVE1000";

    var userToken =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ,
                PermissionCodes.BILLING_RECHARGE_CREATE));
    var adminWriteToken =
        BillingJwtTestSupport.accessToken(
            adminId,
            tenantId,
            List.of(
                PermissionCodes.ADMIN_BILLING_READ,
                PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE));

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
                            "kind",
                            "discount",
                            "discountCents",
                            1000,
                            "points",
                            1,
                            "status",
                            "active"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.kind").value("discount"))
        .andExpect(jsonPath("$.discountCents").value(1000));

    var createBody =
        mockMvc
            .perform(
                post("/v1/billing/recharge-orders")
                    .header("Authorization", "Bearer " + userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "packageCode",
                                "starter_500",
                                "channel",
                                "mock",
                                "couponCode",
                                couponCode))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.listPriceCents").value(4900))
            .andExpect(jsonPath("$.couponDiscountCents").value(1000))
            .andExpect(jsonPath("$.priceCents").value(3900))
            .andExpect(jsonPath("$.couponCode").value(couponCode))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var orderNo = objectMapper.readTree(createBody).get("orderNo").asText();

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders/" + orderNo + "/mock-pay")
                .header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("paid"))
        .andExpect(jsonPath("$.priceCents").value(3900))
        .andExpect(jsonPath("$.walletBalance").value(500));

    mockMvc
        .perform(
            post("/v1/billing/coupons/redeem")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("code", couponCode))))
        .andExpect(status().isBadRequest());
  }
}

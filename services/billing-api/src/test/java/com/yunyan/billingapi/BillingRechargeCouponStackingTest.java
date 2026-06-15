package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BillingRechargeCouponStackingTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @DynamicPropertySource
  static void couponStackingProperties(DynamicPropertyRegistry registry) {
    registry.add("billing.coupon.min-payable-cents-after-discount", () -> "100");
  }

  @Test
  void blocksSecondPendingRechargeWithCoupon() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var couponA = "STACKA";
    var couponB = "STACKB";

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

    for (var code : List.of(couponA, couponB)) {
      mockMvc
          .perform(
              post("/v1/admin/billing/coupons")
                  .header("Authorization", "Bearer " + adminWriteToken)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(
                      objectMapper.writeValueAsString(
                          Map.of(
                              "code",
                              code,
                              "kind",
                              "discount",
                              "discountCents",
                              500,
                              "points",
                              1,
                              "status",
                              "active"))))
          .andExpect(status().isOk());
    }

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
                            couponA))))
        .andExpect(status().isOk());

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
                            couponB))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void rejectsFullDiscountBelowMinPayable() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var couponCode = "FULL4900";

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
                            4900,
                            "points",
                            1,
                            "status",
                            "active"))))
        .andExpect(status().isOk());

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
        .andExpect(status().isBadRequest());
  }
}

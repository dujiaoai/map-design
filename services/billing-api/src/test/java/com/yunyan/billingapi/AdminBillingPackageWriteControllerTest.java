package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminBillingPackageWriteControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired SysAdminAuditLogMapper auditLogMapper;

  @Test
  void listPackages_withWriteOnlyPermission_returns200() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            tenantId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE));

    mockMvc
        .perform(
            get("/v1/admin/billing/packages").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items").isArray());
  }

  @Test
  void createAndPatchPackage_writesAuditLog() throws Exception {
    var tenantId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId,
            tenantId,
            List.of(PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE));
    var auditBefore = auditLogMapper.countByAction(AdminAuditLogService.ACTION_BILLING_PACKAGE_WRITE);

    mockMvc
        .perform(
            post("/v1/admin/billing/packages")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "code",
                            "enterprise_10000",
                            "points",
                            10000,
                            "priceCents",
                            89900,
                            "sortOrder",
                            40))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value("enterprise_10000"))
        .andExpect(jsonPath("$.points").value(10000));

    mockMvc
        .perform(
            patch("/v1/admin/billing/packages/enterprise_10000")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "inactive"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("inactive"));

    assertThat(auditLogMapper.countByAction(AdminAuditLogService.ACTION_BILLING_PACKAGE_WRITE)
            - auditBefore)
        .isEqualTo(2);
  }

  @Test
  void createPackage_withoutWritePermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            tenantId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));

    mockMvc
        .perform(
            post("/v1/admin/billing/packages")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("code", "denied_pkg", "points", 100, "priceCents", 100))))
        .andExpect(status().isForbidden());
  }
}

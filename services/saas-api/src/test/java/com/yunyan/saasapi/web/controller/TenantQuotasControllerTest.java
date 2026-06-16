package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(
    scripts = {
      "/sql/auth-test-seed.sql",
      "/sql/tenants-multi-membership-seed.sql",
      "/sql/tenants-features-seed.sql"
    })
class TenantQuotasControllerTest {

  private static final String TEST_TENANT_ID = "11111111-1111-1111-1111-111111111101";
  private static final String OTHER_TENANT_ID = "99999999-9999-9999-9999-999999999901";
  private static final String ORPHAN_TENANT_ID = "11111111-1111-1111-1111-111111111199";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void quotas_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/tenants/" + TEST_TENANT_ID + "/quotas")).andExpect(status().isUnauthorized());
  }

  @Test
  void quotas_withTenantAdmin_returnsFreePlanLimits() throws Exception {
    mockMvc
        .perform(
            get("/v1/tenants/" + TEST_TENANT_ID + "/quotas")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenantId").value(TEST_TENANT_ID))
        .andExpect(jsonPath("$.plan").value("free"))
        .andExpect(jsonPath("$.seats.limit").value(5))
        .andExpect(jsonPath("$.seats.used").value(2))
        .andExpect(jsonPath("$.apiRate.limitPerMinute").value(60))
        .andExpect(jsonPath("$.storage.limitBytes").value(1073741824))
        .andExpect(jsonPath("$.storage.usedBytes", is(0)));
  }

  @Test
  void quotas_forOrphanTenant_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/tenants/" + ORPHAN_TENANT_ID + "/quotas")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  void quotas_withPlatformAdmin_crossTenant_returnsQuotas() throws Exception {
    mockMvc
        .perform(
            get("/v1/tenants/" + OTHER_TENANT_ID + "/quotas")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenantId").value(OTHER_TENANT_ID))
        .andExpect(jsonPath("$.seats.used").value(1));
  }

  private String loginAccessToken(String email) throws Exception {
    return JsonPath.read(loginBody(email), "$.accessToken");
  }

  private String loginBody(String email) throws Exception {
    return mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }
}

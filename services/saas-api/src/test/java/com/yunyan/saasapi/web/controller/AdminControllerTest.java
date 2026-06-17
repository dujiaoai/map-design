package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
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
@Sql(scripts = "/sql/auth-test-seed.sql")
class AdminControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void adminPing_withoutToken_returnsOkAndUnauthenticated() throws Exception {
    mockMvc
        .perform(get("/v1/admin/ping"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"))
        .andExpect(jsonPath("$.authenticated").value(false))
        .andExpect(jsonPath("$.platformAdmin").value(false));
  }

  @Test
  void adminPing_withTenantAdmin_returnsOkWithoutPlatformAdmin() throws Exception {
    var accessToken = loginAccessToken("admin@test.local");

    mockMvc
        .perform(get("/v1/admin/ping").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"))
        .andExpect(jsonPath("$.authenticated").value(true))
        .andExpect(jsonPath("$.platformAdmin").value(false));
  }

  @Test
  void adminPing_withPlatformAdmin_returnsOkAndPlatformAdmin() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(get("/v1/admin/ping").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"))
        .andExpect(jsonPath("$.authenticated").value(true))
        .andExpect(jsonPath("$.platformAdmin").value(true));
  }

  @Test
  void adminStats_withoutToken_returnsUnauthorized() throws Exception {
    mockMvc.perform(get("/v1/admin/stats")).andExpect(status().isUnauthorized());
  }

  @Test
  void adminStats_withTenantAdmin_returnsForbidden() throws Exception {
    var accessToken = loginAccessToken("admin@test.local");

    mockMvc
        .perform(get("/v1/admin/stats").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminStats_withPlatformAdmin_returnsCounts() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(get("/v1/admin/stats").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenantCount").isNumber())
        .andExpect(jsonPath("$.userCount").isNumber())
        .andExpect(jsonPath("$.activeTenantCount").isNumber());
  }

  @Test
  void systemFlags_withoutToken_returnsUnauthorized() throws Exception {
    mockMvc.perform(get("/v1/admin/system/flags")).andExpect(status().isUnauthorized());
  }

  @Test
  void systemFlags_withPlatformAdmin_returnsReadOnlySummary() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(get("/v1/admin/system/flags").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.registration.allowPublicOrgSignup").isBoolean())
        .andExpect(jsonPath("$.registration.allowPublicPersonalSignup").isBoolean())
        .andExpect(jsonPath("$.mail.enabled").isBoolean())
        .andExpect(jsonPath("$.rateLimit.enabled").isBoolean())
        .andExpect(jsonPath("$.tenantRls.enabled").isBoolean())
        .andExpect(jsonPath("$.billing.integrationEnabled").isBoolean())
        .andExpect(jsonPath("$.mfa.enforcementEnabled").isBoolean())
        .andExpect(jsonPath("$.mfa.totpEnrollmentAvailable").value(true))
        .andExpect(jsonPath("$.mfa.enrolledPlatformAdminCount").value(0))
        .andExpect(jsonPath("$.oidc.enabled").value(false))
        .andExpect(jsonPath("$.oidc.authorizationCodeFlowAvailable").value(false))
        .andExpect(jsonPath("$.oidc.configuredProviderCount").value(0))
        .andExpect(jsonPath("$.runtime.activeProfiles").isArray());
  }

  @Test
  void systemDependencies_withoutToken_returnsUnauthorized() throws Exception {
    mockMvc.perform(get("/v1/admin/system/dependencies")).andExpect(status().isUnauthorized());
  }

  @Test
  void systemDependencies_withPlatformAdmin_returnsSaasAndBillingNodes() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            get("/v1/admin/system/dependencies").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes[0].id").value("saas-api"))
        .andExpect(jsonPath("$.nodes[0].status").value("UP"))
        .andExpect(jsonPath("$.nodes[1].id").value("billing-api"))
        .andExpect(jsonPath("$.nodes[1].status").value("DISABLED"))
        .andExpect(jsonPath("$.edges[0].from").value("saas-api"))
        .andExpect(jsonPath("$.edges[0].to").value("billing-api"));
  }

  @Test
  void login_withPlatformAdmin_returnsPlatformPermissions() throws Exception {
    var loginBody = loginBody("platform@test.local");

    JsonPath.read(loginBody, "$.user.permissions");
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "platform@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.permissions", hasItem(PermissionCodes.ADMIN_TENANTS_READ)))
        .andExpect(jsonPath("$.user.permissions", hasItem(PermissionCodes.ADMIN_ROLES_WRITE)))
        .andExpect(jsonPath("$.user.permissions").isArray());
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

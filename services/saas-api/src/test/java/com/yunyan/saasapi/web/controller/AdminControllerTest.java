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
  void adminPing_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/ping")).andExpect(status().isUnauthorized());
  }

  @Test
  void adminPing_withTenantAdmin_returns403() throws Exception {
    var accessToken = loginAccessToken("admin@test.local");

    mockMvc
        .perform(get("/v1/admin/ping").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminPing_withPlatformAdmin_returns200() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(get("/v1/admin/ping").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"));
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

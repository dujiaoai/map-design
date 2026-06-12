package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
@Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/reset-role-permissions.sql"})
class AdminTenantMembersControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");
  private static final UUID OTHER_TENANT_ID =
      UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listMembers_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(get("/v1/admin/tenants/" + TEST_TENANT_ID + "/members"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void listMembers_withPlatformAdmin_crossTenant_returnsMembers() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + OTHER_TENANT_ID + "/members")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.members", hasSize(1)))
        .andExpect(jsonPath("$.members[*].email", hasItem("other@test.local")));
  }

  @Test
  void listMembers_withTenantAdmin_returnsMembers() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/members")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.members", hasSize(2)))
        .andExpect(jsonPath("$.members[*].email", hasItem("admin@test.local")));
  }

  @Test
  void listMembers_withWrongTenant_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + OTHER_TENANT_ID + "/members")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  void inviteMember_withTenantAdmin_returns201() throws Exception {
    var email = "invited-" + System.currentTimeMillis() + "@test.local";

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password123",
                            "roleCode", "MEMBER"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value(email))
        .andExpect(jsonPath("$.roles[0]").value("MEMBER"));
  }

  @Test
  void updateMemberRoles_withTenantAdmin_returnsUpdatedRoles() throws Exception {
    var email = "roles-" + System.currentTimeMillis() + "@test.local";
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members")
                    .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", email,
                                "password", "password123",
                                "roleCode", "MEMBER"))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var userId = JsonPath.read(createBody, "$.id");

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + userId + "/roles")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("roleCodes", List.of("VIEWER")))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roles[0]").value("VIEWER"));
  }

  @Test
  void updateMemberRoles_platformAdminRole_returns400() throws Exception {
    var email = "badrole-" + System.currentTimeMillis() + "@test.local";
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members")
                    .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", email,
                                "password", "password123",
                                "roleCode", "MEMBER"))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var userId = JsonPath.read(createBody, "$.id");

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + userId + "/roles")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("roleCodes", List.of("PLATFORM_ADMIN")))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void patchMember_disableBlocksLogin() throws Exception {
    var email = "disable-" + System.currentTimeMillis() + "@test.local";
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members")
                    .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", email,
                                "password", "password123",
                                "roleCode", "MEMBER"))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var userId = JsonPath.read(createBody, "$.id");

    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + userId)
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "disabled"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("disabled"));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password123",
                            "tenantId", "test"))))
        .andExpect(status().isUnauthorized());
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

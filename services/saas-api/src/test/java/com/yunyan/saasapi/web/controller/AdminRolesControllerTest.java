package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
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
class AdminRolesControllerTest {

  private static final UUID MEMBER_ROLE_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000003");

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void listRoles_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/roles")).andExpect(status().isUnauthorized());
  }

  @Test
  void listRoles_withTenantAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/roles")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  void listRoles_withPlatformAdmin_returnsFourRoles() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/roles")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roles", hasSize(4)))
        .andExpect(jsonPath("$.roles[*].code", hasItem("MEMBER")));
  }

  @Test
  void listPermissions_withPlatformAdmin_returnsCatalog() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/permissions")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.permissions", hasSize(11)))
        .andExpect(jsonPath("$.permissions[*].code", hasItem(PermissionCodes.ADMIN_ROLES_WRITE)));
  }

  @Test
  void getRolePermissions_memberRole_returnsWorkspacePermissions() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/roles/" + MEMBER_ROLE_ID + "/permissions")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roleCode").value("MEMBER"))
        .andExpect(jsonPath("$.permissions", hasSize(3)))
        .andExpect(jsonPath("$.permissions[*].code", hasItem(PermissionCodes.WORKSPACE_MAP_WRITE)));
  }

  @Test
  void updateRolePermissions_restrictsMemberToReadOnlyWorkspace() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            put("/v1/admin/roles/" + MEMBER_ROLE_ID + "/permissions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "permissionCodes",
                            List.of(
                                PermissionCodes.WORKSPACE_USE,
                                PermissionCodes.WORKSPACE_MAP_READ)))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.permissions", hasSize(2)))
        .andExpect(jsonPath("$.permissions[*].code", hasItem(PermissionCodes.WORKSPACE_USE)))
        .andExpect(
            jsonPath(
                "$.permissions[*].code",
                org.hamcrest.Matchers.not(hasItem(PermissionCodes.WORKSPACE_MAP_WRITE))));

    mockMvc
        .perform(
            get("/v1/admin/roles/" + MEMBER_ROLE_ID + "/permissions")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.permissions", hasSize(2)));
  }

  @Test
  void updateRolePermissions_withUnknownCode_returns400() throws Exception {
    mockMvc
        .perform(
            put("/v1/admin/roles/" + MEMBER_ROLE_ID + "/permissions")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("permissionCodes", List.of("does:not:exist")))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Unknown permission")));
  }

  @Test
  void updateRolePermissions_withPlatformScopeOnMember_returns400() throws Exception {
    mockMvc
        .perform(
            put("/v1/admin/roles/" + MEMBER_ROLE_ID + "/permissions")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("permissionCodes", List.of(PermissionCodes.ADMIN_TENANTS_READ)))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("not allowed for role MEMBER")));
  }

  @Test
  void getRolePermissions_unknownRole_returns404() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/roles/" + UUID.randomUUID() + "/permissions")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isNotFound());
  }

  @Test
  void updateRolePermissions_revokesMemberRefreshToken() throws Exception {
    var memberLoginBody = loginBody("other@test.local", "other");
    var refreshToken = JsonPath.read(memberLoginBody, "$.refreshToken");
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            put("/v1/admin/roles/" + MEMBER_ROLE_ID + "/permissions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "permissionCodes",
                            List.of(
                                PermissionCodes.WORKSPACE_USE,
                                PermissionCodes.WORKSPACE_MAP_READ)))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
        .andExpect(status().isUnauthorized());
  }

  private String loginAccessToken(String email) throws Exception {
    return JsonPath.read(loginBody(email), "$.accessToken");
  }

  private String loginBody(String email) throws Exception {
    return loginBody(email, "test");
  }

  private String loginBody(String email, String tenantSlug) throws Exception {
    return mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password",
                            "tenantId", tenantSlug))))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }
}

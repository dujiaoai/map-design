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
class AdminTenantRolesControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");
  private static final UUID DISABLED_MEMBER_USER_ID =
      UUID.fromString("22222222-2222-2222-2222-222222222204");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listAssignablePermissions_returnsTenantAndWorkspaceScopes() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/assignable-permissions")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.permissions", hasSize(5)))
        .andExpect(jsonPath("$.permissions[*].code", hasItem(PermissionCodes.ADMIN_MEMBERS_READ)))
        .andExpect(jsonPath("$.permissions[*].code", hasItem(PermissionCodes.WORKSPACE_USE)));
  }

  @Test
  void listAssignableRoles_includesSystemAndAllowsCustom() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/assignable-roles")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roles", hasSize(3)))
        .andExpect(jsonPath("$.roles[*].code", hasItem("TENANT_ADMIN")));
  }

  @Test
  void createCustomRole_andAssignToMember() throws Exception {
    var tenantAdminToken = loginAccessToken("admin@test.local");

    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/roles")
                    .header("Authorization", "Bearer " + tenantAdminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "code",
                                "map_editor",
                                "name",
                                "地图编辑员",
                                "permissionCodes",
                                List.of(
                                    PermissionCodes.WORKSPACE_USE,
                                    PermissionCodes.WORKSPACE_MAP_READ)))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("map_editor"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var roleId = JsonPath.read(createBody, "$.id");

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/assignable-roles")
                .header("Authorization", "Bearer " + tenantAdminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roles[*].code", hasItem("map_editor")));

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + DISABLED_MEMBER_USER_ID + "/roles")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("roleCodes", List.of("map_editor")))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roles", hasItem("map_editor")));

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/roles/" + roleId + "/permissions")
                .header("Authorization", "Bearer " + tenantAdminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.permissions", hasSize(2)));
  }

  @Test
  void updateCustomRolePermissions_withMultipleCodes_persistsAll() throws Exception {
    var tenantAdminToken = loginAccessToken("admin@test.local");

    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/roles")
                    .header("Authorization", "Bearer " + tenantAdminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "code",
                                "ops_bundle",
                                "name",
                                "运营权限包",
                                "permissionCodes",
                                List.of(PermissionCodes.ADMIN_MEMBERS_READ)))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var roleId = JsonPath.read(createBody, "$.id");

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/roles/" + roleId + "/permissions")
                .header("Authorization", "Bearer " + tenantAdminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "permissionCodes",
                            List.of(
                                PermissionCodes.ADMIN_MEMBERS_READ,
                                PermissionCodes.ADMIN_MEMBERS_WRITE,
                                PermissionCodes.WORKSPACE_USE,
                                PermissionCodes.WORKSPACE_MAP_READ,
                                PermissionCodes.WORKSPACE_MAP_WRITE)))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.permissions", hasSize(5)));

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/roles/" + roleId + "/permissions")
                .header("Authorization", "Bearer " + tenantAdminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.permissions", hasSize(5)))
        .andExpect(jsonPath("$.permissions[*].code", hasItem(PermissionCodes.WORKSPACE_MAP_WRITE)));
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

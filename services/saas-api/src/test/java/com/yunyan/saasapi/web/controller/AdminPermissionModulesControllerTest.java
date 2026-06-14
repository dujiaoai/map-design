package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
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
@Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/reset-role-permissions.sql"})
class AdminPermissionModulesControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void listModules_withPlatformAdmin_returnsSeededModules() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/permission-modules")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.modules", hasSize(5)))
        .andExpect(jsonPath("$.modules[*].code", hasItem("admin_roles")));
  }

  @Test
  void createModuleAndPermission_lifecycle() throws Exception {
    var token = loginAccessToken("platform@test.local");

    var createModuleBody =
        mockMvc
            .perform(
                post("/v1/admin/permission-modules")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "code", "map_tools",
                                "name", "地图工具",
                                "description", "自定义地图工具权限",
                                "scope", "workspace",
                                "sortOrder", 60))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("map_tools"))
            .andExpect(jsonPath("$.system").value(false))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var moduleId = JsonPath.read(createModuleBody, "$.id");

    var createPermissionBody =
        mockMvc
            .perform(
                post("/v1/admin/permission-modules/" + moduleId + "/permissions")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "action", "layer:read",
                                "name", "图层只读",
                                "description", "查看专题图层"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("map_tools:layer:read"))
            .andExpect(jsonPath("$.moduleCode").value("map_tools"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var permissionId = JsonPath.read(createPermissionBody, "$.id");

    mockMvc
        .perform(
            patch("/v1/admin/permissions/" + permissionId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "图层查看"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("图层查看"));

    mockMvc
        .perform(
            delete("/v1/admin/permissions/" + permissionId).header("Authorization", "Bearer " + token))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            delete("/v1/admin/permission-modules/" + moduleId)
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isNoContent());
  }

  @Test
  void createPermission_onSystemModule_returns400() throws Exception {
    var token = loginAccessToken("platform@test.local");
    var listBody =
        mockMvc
            .perform(
                get("/v1/admin/permission-modules").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    @SuppressWarnings("unchecked")
    List<Map<String, Object>> modules = JsonPath.read(listBody, "$.modules");
    var adminRolesModuleId =
        modules.stream()
            .filter(module -> "admin_roles".equals(module.get("code")))
            .map(module -> (String) module.get("id"))
            .findFirst()
            .orElseThrow();

    mockMvc
        .perform(
            post("/v1/admin/permission-modules/" + adminRolesModuleId + "/permissions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("action", "extra", "name", "不应成功"))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void listModules_withTenantAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/permission-modules")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
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

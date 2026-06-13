package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
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
class AdminTenantsControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void listTenants_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/tenants")).andExpect(status().isUnauthorized());
  }

  @Test
  void listTenants_withTenantAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  void listTenants_withPlatformAdmin_returnsSeededTenant() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenants[*].slug", hasItem("test")))
        .andExpect(jsonPath("$.tenants[*].status", hasItem("active")));
  }

  @Test
  void createTenant_withPlatformAdmin_returns201() throws Exception {
    var slug = "acme-" + System.currentTimeMillis();

    mockMvc
        .perform(
            post("/v1/admin/tenants")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("name", "Acme Corp", "slug", slug, "plan", "pro"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.slug").value(slug))
        .andExpect(jsonPath("$.plan").value("pro"))
        .andExpect(jsonPath("$.status").value("active"));
  }

  @Test
  void createTenant_duplicateSlug_returns409() throws Exception {
    mockMvc
        .perform(
            post("/v1/admin/tenants")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("name", "Duplicate", "slug", "test"))))
        .andExpect(status().isConflict());
  }

  @Test
  void patchTenant_suspendBlocksLogin() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "suspended"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("suspended"));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Tenant is suspended"));
  }

  @Test
  void listTenants_withPagination_returnsPageMeta() throws Exception {
    var token = loginAccessToken("platform@test.local");
    for (int i = 0; i < 3; i++) {
      var slug = "page-tenant-" + i + "-" + System.currentTimeMillis();
      mockMvc
          .perform(
              post("/v1/admin/tenants")
                  .header("Authorization", "Bearer " + token)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(
                      objectMapper.writeValueAsString(
                          Map.of("name", "Page Tenant " + i, "slug", slug))))
          .andExpect(status().isCreated());
    }

    mockMvc
        .perform(
            get("/v1/admin/tenants")
                .param("page", "1")
                .param("size", "2")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenants", hasSize(2)))
        .andExpect(jsonPath("$.total").value(org.hamcrest.Matchers.greaterThanOrEqualTo(5)))
        .andExpect(jsonPath("$.page").value(1))
        .andExpect(jsonPath("$.size").value(2));
  }

  @Test
  void listTenants_withSearch_filtersBySlug() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants")
                .param("q", "test")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenants[*].slug", hasItem("test")));
  }

  @Test
  void getTenant_withPlatformAdmin_returnsTenant() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID)
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.slug").value("test"))
        .andExpect(jsonPath("$.status").value("active"));
  }

  @Test
  void getTenant_withTenantAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID)
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  void getTenant_unknownId_returns404() throws Exception {
    var unknownId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + unknownId)
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isNotFound());
  }

  @Test
  void patchTenant_emptyBody_returns400() throws Exception {
    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID)
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest());
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

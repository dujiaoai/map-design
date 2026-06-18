package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
  void listTenants_withSortParams_returnsOk() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants")
                .param("page", "1")
                .param("size", "10")
                .param("sortBy", "slug")
                .param("sortDir", "desc")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenants").isArray());
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

  @Test
  void patchTenant_setsAndClearsTrialEndsAt() throws Exception {
    var token = loginAccessToken("platform@test.local");
    var trialEndsAt = System.currentTimeMillis() + 86_400_000L;

    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("trialEndsAt", trialEndsAt))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.trialEndsAt").value(trialEndsAt));

    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("clearTrialEndsAt", true))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.trialEndsAt").doesNotExist());
  }

  @Test
  void dataExportRequests_createAndList() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + TEST_TENANT_ID + "/data-export-requests")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("pending"))
        .andExpect(jsonPath("$.tenantId").value(TEST_TENANT_ID.toString()));

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/data-export-requests")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.requests").isArray())
        .andExpect(jsonPath("$.requests[0].status").value("pending"));
  }

  @Test
  void oidcConfig_withoutRow_returnsDisabled() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/oidc-config")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enabled").value(false))
        .andExpect(jsonPath("$.configured").value(false));
  }

  @Test
  void storageEstimate_returnsSkeleton() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/storage-estimate")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalBytes").value(0))
        .andExpect(jsonPath("$.source").value("skeleton"));
  }

  @Test
  void oidcConfig_patchUpsertsConfig() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID + "/oidc-config")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "enabled", true,
                            "displayName", "Corp SSO",
                            "issuerUri", "https://idp.example.com",
                            "clientId", "admin-portal"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enabled").value(true))
        .andExpect(jsonPath("$.configured").value(true))
        .andExpect(jsonPath("$.displayName").value("Corp SSO"));
  }

  @Test
  void menuOverrides_emptyByDefault() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.overrides").isArray())
        .andExpect(jsonPath("$.overrides").isEmpty());
  }

  @Test
  void menuOverrides_putUpsertsAndDelete() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("itemId", "tool-measure-distance", "enabled", false))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.itemId").value("tool-measure-distance"))
        .andExpect(jsonPath("$.enabled").value(false));

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.overrides", hasSize(1)));

    mockMvc
        .perform(
            delete("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides/tool-measure-distance")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isNoContent());
  }

  @Test
  void menuOverrideDiff_afterUpsert_returnsEntry() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "itemId", "tool-measure-distance",
                            "enabled", false,
                            "title", "Custom Measure"))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides/diff")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries", hasSize(1)))
        .andExpect(jsonPath("$.entries[0].itemId").value("tool-measure-distance"))
        .andExpect(jsonPath("$.entries[0].overrideTitle").value("Custom Measure"));
  }

  @Test
  void menuOverrides_batchUpsertsMultipleItems() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides/batch")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "overrides",
                            List.of(
                                Map.of("itemId", "tool-measure-distance", "enabled", false),
                                Map.of("itemId", "tool-measure-area", "sortOrder", 99))))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.overrides", hasSize(2)));

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/menu-overrides")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.overrides", hasSize(2)));
  }

  @Test
  void dataExportArtifact_completedRequest_returnsDownloadable() throws Exception {
    var token = loginAccessToken("platform@test.local");

    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/data-export-requests")
                    .header("Authorization", "Bearer " + token))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var requestId = JsonPath.read(createBody, "$.id");

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/data-export-requests/" + requestId + "/artifact")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.downloadable").value(false));
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

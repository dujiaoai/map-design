package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
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
class MenusControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listMenus_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/menus")).andExpect(status().isUnauthorized());
  }

  @Test
  void listMenus_withTenantMember_returnsFilteredSections() throws Exception {
    mockMvc
        .perform(
            get("/v1/menus")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sections[*].id", hasItem("layers")))
        .andExpect(jsonPath("$.sections[*].id", hasItem("ops")))
        .andExpect(jsonPath("$.items[*].id", hasItem("module-custom-highway-alert")))
        .andExpect(jsonPath("$.items[*].id", hasItem("module-custom-live-share")))
        .andExpect(jsonPath("$.items[*].id", hasItem("tool-measure-distance")));
  }

  @Test
  void listMenus_withoutHighwayAlertFeature_hidesCustomModule() throws Exception {
    mockMvc
        .perform(
            get("/v1/menus")
                .header(
                    "Authorization",
                    "Bearer " + loginAccessToken("admin@test.local", "second")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[*].id", hasItem("module-custom-live-share")))
        .andExpect(jsonPath("$.items[*].id", not(hasItem("module-custom-highway-alert"))));
  }

  private String loginAccessToken(String email) throws Exception {
    return loginAccessToken(email, "test");
  }

  private String loginAccessToken(String email, String tenantSlug) throws Exception {
    return JsonPath.read(loginBody(email, tenantSlug), "$.accessToken");
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

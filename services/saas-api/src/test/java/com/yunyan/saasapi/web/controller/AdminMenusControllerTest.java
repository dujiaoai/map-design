package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
@Sql(
    scripts = {
      "/sql/auth-test-seed.sql",
      "/sql/reset-role-permissions.sql",
      "/sql/admin-tenant-features-seed.sql"
    })
class AdminMenusControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void getMenus_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/menus")).andExpect(status().isUnauthorized());
  }

  @Test
  void getMenus_withPlatformAdmin_returnsSeededCatalog() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/menus")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sections", hasSize(5)))
        .andExpect(jsonPath("$.sections[*].id", hasItem("layers")))
        .andExpect(jsonPath("$.toolItems", hasSize(12)))
        .andExpect(jsonPath("$.toolItems[*].id", hasItem("tool-measure-distance")));
  }

  @Test
  void updateMenus_disablingItem_hidesFromRuntimeMenus() throws Exception {
    var token = loginAccessToken("platform@test.local");
    var body =
        mockMvc
            .perform(get("/v1/admin/menus").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    @SuppressWarnings("unchecked")
    var root = objectMapper.readValue(body, Map.class);
    @SuppressWarnings("unchecked")
    var sections = (List<Map<String, Object>>) root.get("sections");
    @SuppressWarnings("unchecked")
    var toolItems = (List<Map<String, Object>>) root.get("toolItems");

    var updateSections =
        sections.stream()
            .map(
                section -> {
                  @SuppressWarnings("unchecked")
                  var items = (List<Map<String, Object>>) section.get("items");
                  var updatedItems =
                      items.stream()
                          .map(
                              item ->
                                  Map.of(
                                      "id", item.get("id"),
                                      "title", item.get("title"),
                                      "sortOrder", item.get("sortOrder"),
                                      "enabled",
                                      "module-thematic".equals(item.get("id"))
                                          ? false
                                          : item.get("enabled")))
                          .toList();
                  return Map.of(
                      "id", section.get("id"),
                      "label", section.get("label"),
                      "sortOrder", section.get("sortOrder"),
                      "enabled", section.get("enabled"),
                      "items", updatedItems);
                })
            .toList();

    var updateToolItems =
        toolItems.stream()
            .map(
                item ->
                    Map.of(
                        "id", item.get("id"),
                        "title", item.get("title"),
                        "sortOrder", item.get("sortOrder"),
                        "enabled", item.get("enabled")))
            .toList();

    mockMvc
        .perform(
            put("/v1/admin/menus")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("sections", updateSections, "toolItems", updateToolItems))))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.sections[?(@.id=='layers')].items[?(@.id=='module-thematic')].enabled")
                .value(false));

    mockMvc
        .perform(
            get("/v1/menus")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[*].id", not(hasItem("module-thematic"))));
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

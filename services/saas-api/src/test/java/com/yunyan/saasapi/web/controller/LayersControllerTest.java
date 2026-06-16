package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
      "/sql/map-layers-seed.sql"
    })
class LayersControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void list_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/layers")).andExpect(status().isUnauthorized());
  }

  @Test
  void list_withAccessToken_returnsTenantLayers() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(get("/v1/layers").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items", hasSize(3)))
        .andExpect(jsonPath("$.items[*].name", hasItem("专题图层")))
        .andExpect(jsonPath("$.items[*].layerType", hasItem("ortho")))
        .andExpect(jsonPath("$.items[0].sortOrder").value(10));
  }

  @Test
  void list_doesNotReturnOtherTenantLayers() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(get("/v1/layers").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[*].name", not(hasItem("第二租户图层"))));
  }

  @Test
  void create_update_delete_layerLifecycle() throws Exception {
    var accessToken = loginAsTestAdmin();

    var createBody =
        objectMapper.writeValueAsString(
            Map.of(
                "name", "新建图层",
                "layerType", "thematic",
                "visible", true,
                "sortOrder", 5));

    var createResponse =
        mockMvc
            .perform(
                post("/v1/layers")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("新建图层"))
            .andExpect(jsonPath("$.layerType").value("thematic"))
            .andExpect(jsonPath("$.sortOrder").value(5))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var layerId = JsonPath.read(createResponse, "$.id");

    mockMvc
        .perform(
            get("/v1/layers/" + layerId).header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("新建图层"));

    var updateBody =
        objectMapper.writeValueAsString(
            Map.of(
                "name", "已更新图层",
                "layerType", "ortho",
                "visible", false,
                "sortOrder", 99));

    mockMvc
        .perform(
            put("/v1/layers/" + layerId)
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("已更新图层"))
        .andExpect(jsonPath("$.visible").value(false));

    mockMvc
        .perform(
            delete("/v1/layers/" + layerId).header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            get("/v1/layers/" + layerId).header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isNotFound());
  }

  @Test
  void get_otherTenantLayer_returns404() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(
            get("/v1/layers/e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e201")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isNotFound());
  }

  private String loginAsTestAdmin() throws Exception {
    var loginBody =
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
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(loginBody, "$.accessToken");
  }
}

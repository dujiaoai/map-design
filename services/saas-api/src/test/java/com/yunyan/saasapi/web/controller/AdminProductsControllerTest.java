package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
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
      "/sql/reset-role-permissions.sql",
    })
class AdminProductsControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listProducts_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/products")).andExpect(status().isUnauthorized());
  }

  @Test
  void listProducts_withPlatformAdmin_returnsMapDesign() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/products")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.products", hasSize(1)))
        .andExpect(jsonPath("$.products[*].code", hasItem("map-design")));
  }

  @Test
  void getProduct_byCode_returnsDetail() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/products/map-design")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value("map-design"))
        .andExpect(jsonPath("$.name").value("地图工作台"));
  }

  @Test
  void productFeatureCatalog_withPlatformAdmin_returnsCatalog() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/products/map-design/features")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.features", hasSize(3)));
  }

  @Test
  void createProduct_withPlatformAdmin_returns201() throws Exception {
    mockMvc
        .perform(
            post("/v1/admin/products")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "code", "uav-cloud",
                            "name", "机库云",
                            "description", "无人机机库 SaaS"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.code").value("uav-cloud"))
        .andExpect(jsonPath("$.name").value("机库云"))
        .andExpect(jsonPath("$.status").value("active"));
  }

  @Test
  void createProduct_duplicateCode_returns409() throws Exception {
    var token = loginAccessToken("platform@test.local");
    var body =
        objectMapper.writeValueAsString(
            Map.of("code", "dup-product", "name", "重复测试", "description", "first"));
    mockMvc
        .perform(
            post("/v1/admin/products")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isCreated());
    mockMvc
        .perform(
            post("/v1/admin/products")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isConflict());
  }

  @Test
  void addProductFeature_withPlatformAdmin_returns201() throws Exception {
    var token = loginAccessToken("platform@test.local");
    mockMvc
        .perform(
            post("/v1/admin/products")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("code", "feat-product", "name", "能力测试产品"))))
        .andExpect(status().isCreated());
    mockMvc
        .perform(
            post("/v1/admin/products/feat-product/features")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "code", "uav.dock-monitor",
                            "name", "机库监控",
                            "description", "机库状态面板"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.code").value("uav.dock-monitor"))
        .andExpect(jsonPath("$.name").value("机库监控"));
  }

  private String loginAccessToken(String email) throws Exception {
    var response =
        mockMvc
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
    return JsonPath.read(response, "$.accessToken");
  }
}

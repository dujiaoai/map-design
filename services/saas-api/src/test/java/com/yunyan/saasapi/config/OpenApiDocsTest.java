package com.yunyan.saasapi.config;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpenApiDocsTest {

  @Autowired
  MockMvc mockMvc;

  @Test
  void apiDocs_includesV1Paths() throws Exception {
    mockMvc
        .perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("/v1/auth/register")))
        .andExpect(content().string(containsString("/v1/auth/login")))
        .andExpect(content().string(containsString("RegisterRequest")))
        .andExpect(content().string(containsString("/v1/auth/refresh")))
        .andExpect(content().string(containsString("/v1/auth/logout")))
        .andExpect(content().string(containsString("LoginRequest")))
        .andExpect(content().string(containsString("RefreshRequest")))
        .andExpect(content().string(containsString("/v1/users/me")))
        .andExpect(content().string(containsString("SessionDto")))
        .andExpect(content().string(containsString("SessionUserDto")))
        .andExpect(content().string(containsString("UpdateUserRequest")))
        .andExpect(content().string(containsString("/v1/users/me/password")))
        .andExpect(content().string(containsString("ChangePasswordRequest")))
        .andExpect(content().string(containsString("/v1/tenants")))
        .andExpect(content().string(containsString("/v1/tenants/{tenantId}/features")))
        .andExpect(content().string(containsString("bearerAuth")));
  }

  @Test
  void swaggerUi_isAccessible() throws Exception {
    mockMvc.perform(get("/swagger-ui.html")).andExpect(status().is3xxRedirection());
  }
}

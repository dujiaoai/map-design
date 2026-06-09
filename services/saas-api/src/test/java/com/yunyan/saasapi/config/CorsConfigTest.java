package com.yunyan.saasapi.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
class CorsConfigTest {

  private static final String ALLOWED_ORIGIN = "http://localhost:5175";

  @Autowired
  MockMvc mockMvc;

  @Test
  void preflight_onV1AuthLogin_returnsAllowedOrigin() throws Exception {
    mockMvc
        .perform(
            options("/v1/auth/login")
                .header("Origin", ALLOWED_ORIGIN)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type, Authorization"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", ALLOWED_ORIGIN))
        .andExpect(header().exists("Access-Control-Allow-Methods"));
  }

  @Test
  void get_onV1Ping_withAllowedOrigin_returnsCorsHeaders() throws Exception {
    mockMvc
        .perform(get("/v1/ping").header("Origin", ALLOWED_ORIGIN))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", ALLOWED_ORIGIN));
  }

  @Test
  void preflight_withDisallowedOrigin_doesNotEchoOrigin() throws Exception {
    mockMvc
        .perform(
            options("/v1/auth/login")
                .header("Origin", "http://evil.example.com")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
  }
}

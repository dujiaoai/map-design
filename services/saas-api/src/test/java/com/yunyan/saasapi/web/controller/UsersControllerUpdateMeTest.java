package com.yunyan.saasapi.web.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.advice.GlobalExceptionHandler;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import com.yunyan.saasapi.web.dto.auth.SessionTenantDto;
import com.yunyan.saasapi.web.dto.auth.SessionUserDto;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class UsersControllerUpdateMeTest {

  @Mock
  AuthService authService;

  MockMvc mockMvc;

  ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void setUp() {
    var validator = new LocalValidatorFactoryBean();
    validator.afterPropertiesSet();

    mockMvc = MockMvcBuilders.standaloneSetup(new UsersController(authService))
        .setControllerAdvice(new GlobalExceptionHandler())
        .setValidator(validator)
        .build();
  }

  @Test
  void updateMe_withValidRequest_returns200AndSession() throws Exception {
    when(authService.updateCurrentUser(any(), any())).thenReturn(sampleSession("Updated Name"));

    setPrincipal();

    mockMvc
        .perform(
            put("/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "Updated Name"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.name").value("Updated Name"))
        .andExpect(jsonPath("$.tenant.slug").value("test"));

    SecurityContextHolder.clearContext();
  }

  @Test
  void updateMe_withBlankName_returns400ProblemDetail() throws Exception {
    setPrincipal();

    mockMvc
        .perform(
            put("/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", ""))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors[?(@.field == 'name')]").exists());

    SecurityContextHolder.clearContext();
  }

  private void setPrincipal() {
    var principal =
        new SaasPrincipal(
            UUID.fromString("22222222-2222-2222-2222-222222222201"),
            UUID.fromString("11111111-1111-1111-1111-111111111101"),
            "admin@test.local",
            List.of("TENANT_ADMIN"),
            List.of("workspace:use"),
            null,
            Instant.ofEpochMilli(1_710_000_900_000L));
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
  }

  private static SessionDto sampleSession(String name) {
    return new SessionDto(
        new SessionUserDto(
            "22222222-2222-2222-2222-222222222201",
            "admin@test.local",
            name,
            null,
            null,
            List.of("TENANT_ADMIN"),
            List.of("workspace:use")),
        new SessionTenantDto(
            "11111111-1111-1111-1111-111111111101", "Test Tenant", "test"),
        1_710_000_900_000L);
  }
}

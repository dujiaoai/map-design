package com.yunyan.saasapi.web.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.advice.GlobalExceptionHandler;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import com.yunyan.saasapi.web.dto.auth.SessionTenantDto;
import com.yunyan.saasapi.web.dto.auth.SessionUserDto;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class UsersControllerMeTest {

  @Mock
  AuthService authService;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(new UsersController(authService))
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void me_withPrincipal_returns200AndSessionJson() throws Exception {
    when(authService.getCurrentSession(org.mockito.ArgumentMatchers.any()))
        .thenReturn(sampleSession());

    setPrincipal();

    mockMvc
        .perform(get("/v1/users/me"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value("admin@test.local"))
        .andExpect(jsonPath("$.user.roles[0]").value("TENANT_ADMIN"))
        .andExpect(jsonPath("$.tenant.slug").value("test"))
        .andExpect(jsonPath("$.expiresAt").value(1_710_000_900_000L));

    SecurityContextHolder.clearContext();
  }

  @Test
  void me_whenServiceUnauthorized_returns401ProblemDetail() throws Exception {
    when(authService.getCurrentSession(org.mockito.ArgumentMatchers.any()))
        .thenThrow(AuthException.unauthorized("Not authenticated"));

    setPrincipal();

    mockMvc
        .perform(get("/v1/users/me"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.title").value("Unauthorized"));

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

  private static SessionDto sampleSession() {
    return new SessionDto(
        new SessionUserDto(
            "22222222-2222-2222-2222-222222222201",
            "admin@test.local",
            "Test Admin",
            List.of("TENANT_ADMIN"),
            List.of("workspace:use")),
        new SessionTenantDto(
            "11111111-1111-1111-1111-111111111101", "Test Tenant", "test"),
        1_710_000_900_000L);
  }
}

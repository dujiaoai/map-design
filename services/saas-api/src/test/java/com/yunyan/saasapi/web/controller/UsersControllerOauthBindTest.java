package com.yunyan.saasapi.web.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.application.auth.UserOauthBindService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.advice.GlobalExceptionHandler;
import com.yunyan.saasapi.web.dto.auth.UserOauthBindsResponse;
import com.yunyan.saasapi.web.dto.auth.UserOauthBindsResponse.UserOauthBindItemDto;
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
class UsersControllerOauthBindTest {

  @Mock AuthService authService;
  @Mock UserOauthBindService userOauthBindService;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new UsersController(authService, userOauthBindService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void listMyOauthBinds_returnsBinds() throws Exception {
    when(userOauthBindService.listForCurrentUser(org.mockito.ArgumentMatchers.any()))
        .thenReturn(
            new UserOauthBindsResponse(
                List.of(
                    new UserOauthBindItemDto(
                        "keycloak",
                        "Keycloak (local)",
                        "admin@test.local",
                        Instant.parse("2026-06-01T00:00:00Z"),
                        Instant.parse("2026-06-15T12:00:00Z")))));

    setPrincipal();

    mockMvc
        .perform(get("/v1/users/me/oauth-binds"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.binds.length()").value(1))
        .andExpect(jsonPath("$.binds[0].providerId").value("keycloak"))
        .andExpect(jsonPath("$.binds[0].providerDisplayName").value("Keycloak (local)"));

    SecurityContextHolder.clearContext();
  }

  @Test
  void unbindMyOauthProvider_returns204() throws Exception {
    setPrincipal();

    mockMvc
        .perform(delete("/v1/users/me/oauth-binds/keycloak"))
        .andExpect(status().isNoContent());

    verify(userOauthBindService)
        .unbindForCurrentUser(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq("keycloak"));

    SecurityContextHolder.clearContext();
  }

  private void setPrincipal() {
    var principal =
        new SaasPrincipal(
            UUID.fromString("22222222-2222-2222-2222-222222222201"),
            UUID.fromString("11111111-1111-1111-1111-111111111101"),
            null,
            "admin@test.local",
            List.of("TENANT_ADMIN"),
            List.of("workspace:use"),
            null,
            Instant.parse("2026-06-15T12:00:00Z"));
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
  }
}

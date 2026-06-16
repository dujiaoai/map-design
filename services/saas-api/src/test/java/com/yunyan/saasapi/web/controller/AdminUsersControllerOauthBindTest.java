package com.yunyan.saasapi.web.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yunyan.saasapi.application.admin.UserAdminService;
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
class AdminUsersControllerOauthBindTest {

  private static final UUID TARGET_USER_ID =
      UUID.fromString("22222222-2222-2222-2222-222222222201");

  @Mock UserAdminService userAdminService;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new AdminUsersController(userAdminService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void listUserOauthBinds_returnsBinds() throws Exception {
    when(userAdminService.listUserOauthBinds(TARGET_USER_ID))
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
        .perform(get("/v1/admin/users/" + TARGET_USER_ID + "/oauth-binds"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.binds.length()").value(1))
        .andExpect(jsonPath("$.binds[0].providerId").value("keycloak"));

    SecurityContextHolder.clearContext();
  }

  @Test
  void unbindUserOauth_returns204() throws Exception {
    setPrincipal();

    mockMvc
        .perform(
            delete("/v1/admin/users/" + TARGET_USER_ID + "/oauth-binds/keycloak"))
        .andExpect(status().isNoContent());

    verify(userAdminService)
        .unbindUserOauth(
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.eq(TARGET_USER_ID),
            org.mockito.ArgumentMatchers.eq("keycloak"));

    SecurityContextHolder.clearContext();
  }

  private void setPrincipal() {
    var principal =
        new SaasPrincipal(
            UUID.fromString("33333333-3333-3333-3333-333333333301"),
            UUID.fromString("11111111-1111-1111-1111-111111111101"),
            null,
            "platform@test.local",
            List.of("PLATFORM_ADMIN"),
            List.of("admin:users:read", "admin:users:write"),
            null,
            Instant.parse("2026-06-15T12:00:00Z"));
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
  }
}

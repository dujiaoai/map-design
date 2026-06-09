package com.yunyan.saasapi.web.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.advice.GlobalExceptionHandler;
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
class UsersControllerChangePasswordTest {

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
  void changePassword_withValidRequest_returns204() throws Exception {
    setPrincipal();

    mockMvc
        .perform(
            post("/v1/users/me/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oldPassword", "password", "newPassword", "newpassword"))))
        .andExpect(status().isNoContent());

    verify(authService).changePassword(any(), any());
    SecurityContextHolder.clearContext();
  }

  @Test
  void changePassword_withShortNewPassword_returns400() throws Exception {
    setPrincipal();

    mockMvc
        .perform(
            post("/v1/users/me/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oldPassword", "password", "newPassword", "short"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors[?(@.field == 'newPassword')]").exists());

    SecurityContextHolder.clearContext();
  }

  @Test
  void changePassword_withWrongOldPassword_returns401() throws Exception {
    doThrow(AuthException.unauthorized("Current password is incorrect"))
        .when(authService)
        .changePassword(any(), any());

    setPrincipal();

    mockMvc
        .perform(
            post("/v1/users/me/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oldPassword", "wrong", "newPassword", "newpassword"))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Current password is incorrect"));

    SecurityContextHolder.clearContext();
  }

  private void setPrincipal() {
    var principal =
        new SaasPrincipal(
            UUID.fromString("22222222-2222-2222-2222-222222222201"),
            UUID.fromString("11111111-1111-1111-1111-111111111101"),
            "admin@test.local",
            List.of("TENANT_ADMIN"),
            Instant.ofEpochMilli(1_710_000_900_000L));
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
  }
}

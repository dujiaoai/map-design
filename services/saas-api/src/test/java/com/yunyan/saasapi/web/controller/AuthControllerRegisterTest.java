package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.advice.GlobalExceptionHandler;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.LoginUserDto;
import com.yunyan.saasapi.web.dto.auth.SessionTenantDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class AuthControllerRegisterTest {

  @Mock
  AuthService authService;

  MockMvc mockMvc;

  ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void setUp() {
    var validator = new LocalValidatorFactoryBean();
    validator.afterPropertiesSet();

    mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService))
        .setControllerAdvice(new GlobalExceptionHandler())
        .setValidator(validator)
        .build();
  }

  @Test
  void register_withValidRequest_returns204() throws Exception {
    doNothing().when(authService).requestRegistration(any());

    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "newuser@test.local",
                            "password", "password",
                            "tenantId", "test",
                            "displayName", "New User"))))
        .andExpect(status().isNoContent());
  }

  @Test
  void registerConfirm_withValidToken_returns200AndFlatJsonBody() throws Exception {
    when(authService.confirmRegistration(any())).thenReturn(sampleLoginResponse());

    mockMvc
        .perform(
            post("/v1/auth/register/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", "verify-token"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").value("access-token"))
        .andExpect(jsonPath("$.user.email").value("newuser@test.local"))
        .andExpect(jsonPath("$.user.roles", hasItem("MEMBER")))
        .andExpect(jsonPath("$.user.tenant.slug").value("test"));
  }

  @Test
  void register_withShortPassword_returns400ProblemDetail() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "newuser@test.local",
                            "password", "short",
                            "tenantId", "test"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors[?(@.field == 'password')]").exists());
  }

  @Test
  void register_withUnknownTenant_returns404ProblemDetail() throws Exception {
    doThrow(AuthException.notFound("Tenant not found")).when(authService).requestRegistration(any());

    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "newuser@test.local",
                            "password", "password",
                            "tenantId", "missing"))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.title").value("Not Found"))
        .andExpect(jsonPath("$.detail").value("Tenant not found"));
  }

  @Test
  void register_withDuplicateEmail_returns409ProblemDetail() throws Exception {
    doThrow(AuthException.conflict("Email already registered for this tenant"))
        .when(authService)
        .requestRegistration(any());

    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.title").value("Conflict"));
  }

  private static LoginResponse sampleLoginResponse() {
    return new LoginResponse(
        "access-token",
        "refresh-token",
        900L,
        new LoginUserDto(
            "33333333-3333-3333-3333-333333333301",
            "newuser@test.local",
            "New User",
            List.of("MEMBER"),
            List.of("workspace:use"),
            new SessionTenantDto(
                "11111111-1111-1111-1111-111111111101", "Test Tenant", "test")));
  }
}

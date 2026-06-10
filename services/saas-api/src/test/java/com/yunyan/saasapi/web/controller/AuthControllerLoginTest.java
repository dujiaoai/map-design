package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
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
class AuthControllerLoginTest {

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
  void login_withValidRequest_returns200AndFlatJsonBody() throws Exception {
    when(authService.login(any())).thenReturn(sampleLoginResponse());

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
        .andExpect(jsonPath("$.accessToken").value("access-token"))
        .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
        .andExpect(jsonPath("$.expiresIn").value(900))
        .andExpect(jsonPath("$.user.email").value("admin@test.local"))
        .andExpect(jsonPath("$.user.roles", hasItem("TENANT_ADMIN")))
        .andExpect(jsonPath("$.user.tenant.slug").value("test"))
        .andExpect(jsonPath("$.code").doesNotExist())
        .andExpect(jsonPath("$.data").doesNotExist());
  }

  @Test
  void login_withInvalidEmail_returns400ProblemDetail() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", "not-an-email", "password", "password"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Validation failed"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.errors[?(@.field == 'email')]").exists());
  }

  @Test
  void login_withBlankPassword_returns400ProblemDetail() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", "admin@test.local", "password", ""))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Validation failed"))
        .andExpect(jsonPath("$.errors[?(@.field == 'password')]").exists());
  }

  @Test
  void login_withBadCredentials_returns401ProblemDetail() throws Exception {
    when(authService.login(any())).thenThrow(AuthException.unauthorized("Invalid email or password"));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "wrong",
                            "tenantId", "test"))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.title").value("Unauthorized"))
        .andExpect(jsonPath("$.status").value(401))
        .andExpect(jsonPath("$.detail").value("Invalid email or password"));
  }

  private static LoginResponse sampleLoginResponse() {
    return new LoginResponse(
        "access-token",
        "refresh-token",
        900L,
        new LoginUserDto(
            "22222222-2222-2222-2222-222222222201",
            "admin@test.local",
            "Test Admin",
            List.of("TENANT_ADMIN"),
            List.of("workspace:use"),
            new SessionTenantDto(
                "11111111-1111-1111-1111-111111111101", "Test Tenant", "test")));
  }
}

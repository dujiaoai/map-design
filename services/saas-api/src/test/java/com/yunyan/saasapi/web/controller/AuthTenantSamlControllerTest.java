package com.yunyan.saasapi.web.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.application.auth.TenantSamlAuthService;
import com.yunyan.saasapi.application.auth.TenantSamlSpMetadataService;
import com.yunyan.saasapi.application.admin.TenantSamlIdpRegistrationService;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.SamlAcsRequest;
import com.yunyan.saasapi.web.dto.auth.SamlIdpRegisterRequest;
import com.yunyan.saasapi.web.dto.auth.SamlIdpRegisterResponse;
import com.yunyan.saasapi.web.advice.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AuthTenantSamlControllerTest {

  @Mock TenantSamlAuthService tenantSamlAuthService;
  @Mock TenantSamlSpMetadataService tenantSamlSpMetadataService;
  @Mock TenantSamlIdpRegistrationService tenantSamlIdpRegistrationService;

  @InjectMocks AuthTenantSamlController controller;

  MockMvc mockMvc;
  ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void metadata_returnsXml() throws Exception {
    when(tenantSamlSpMetadataService.buildMetadataXml("test"))
        .thenReturn("<md:EntityDescriptor/>");

    mockMvc
        .perform(get("/v1/auth/tenant-sso/saml/test/metadata"))
        .andExpect(status().isOk())
        .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().string("<md:EntityDescriptor/>"));
  }

  @Test
  void idpRegister_returnsPendingStatus() throws Exception {
    when(tenantSamlIdpRegistrationService.registerPublic(eq("test"), any(SamlIdpRegisterRequest.class)))
        .thenReturn(new SamlIdpRegisterResponse("reg-1", "pending"));

    mockMvc
        .perform(
            post("/v1/auth/tenant-sso/saml/test/idp-register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SamlIdpRegisterRequest("tok", "https://idp/entity"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("pending"));
  }

  @Test
  void authorize_returnsRedirectUrl() throws Exception {
    when(tenantSamlAuthService.beginAuth("test"))
        .thenReturn(new OidcAuthorizeResponse("https://idp/sso", "state-1"));

    mockMvc
        .perform(get("/v1/auth/tenant-sso/saml/test/authorize"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authorizationUrl").value("https://idp/sso"));
  }

  @Test
  void acs_returnsLoginResponse() throws Exception {
    when(tenantSamlAuthService.completeAcs(eq("test"), any(SamlAcsRequest.class)))
        .thenReturn(new LoginResponse("access", "refresh", 900L, null, null, false, null));

    mockMvc
        .perform(
            post("/v1/auth/tenant-sso/saml/test/acs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SamlAcsRequest("resp", "relay"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").value("access"));
  }
}

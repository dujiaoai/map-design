package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpRegistrationRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpRegistration;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.SamlIdpRegisterRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlIdpRegistrationServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSamlIdpRegistrationRepository registrationRepository;
  @Mock private AdminAuditLogService adminAuditLogService;

  @InjectMocks private TenantSamlIdpRegistrationService service;

  @Test
  void registerPublic_createsPendingRegistration() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    tenant.setSlug("acme");
    when(tenantRepository.findBySlug("acme")).thenReturn(Optional.of(tenant));
    when(registrationRepository.findByTokenHash(any())).thenReturn(Optional.empty());

    var response =
        service.registerPublic(
            "acme", new SamlIdpRegisterRequest("secret-token", "https://idp.example/entity"));

    assertThat(response.status()).isEqualTo("pending");
    verify(registrationRepository).insert(any(TenantSamlIdpRegistration.class));
  }

  @Test
  void approve_marksRegistrationApproved() {
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(new SysTenant()));
    var row = new TenantSamlIdpRegistration();
    row.setId(UUID.randomUUID());
    row.setTenantId(TENANT_ID);
    row.setStatus("pending");
    when(registrationRepository.findById(row.getId())).thenReturn(Optional.of(row));

    var response = service.approve(principal(), TENANT_ID, row.getId());

    assertThat(response.status()).isEqualTo("approved");
    verify(adminAuditLogService)
        .recordTenantAction(any(), eq("tenant.saml_idp_registration.approve"), eq(TENANT_ID), any());
  }

  private static SaasPrincipal principal() {
    return new SaasPrincipal(
        UUID.randomUUID(), UUID.randomUUID(), null, "admin@test", List.of(), List.of(), null, null);
  }
}

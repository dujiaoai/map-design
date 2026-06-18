package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.SaasPrincipal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlSpCertificateServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSamlConfigRepository samlConfigRepository;
  @Mock private AdminAuditLogService adminAuditLogService;

  @InjectMocks private TenantSamlSpCertificateService service;

  @Test
  void rotateCertificate_persistsSpPemAndExpiry() {
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(new SysTenant()));
    when(samlConfigRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.empty(), Optional.of(new TenantSamlConfig()));

    var response = service.rotateCertificate(principal(), TENANT_ID);

    assertThat(response.spCertificateExpiresAt()).isPositive();
    verify(samlConfigRepository).insert(any(TenantSamlConfig.class));
    verify(adminAuditLogService).recordTenantAction(any(), eq("tenant.saml_config.rotate_sp_certificate"), eq(TENANT_ID), any());
  }

  private static SaasPrincipal principal() {
    return new SaasPrincipal(
        UUID.randomUUID(), UUID.randomUUID(), null, "admin@test", List.of(), List.of(), null, null);
  }
}

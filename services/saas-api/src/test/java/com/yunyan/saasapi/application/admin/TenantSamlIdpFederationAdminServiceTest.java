package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpFederationRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpFederation;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.CreateTenantSamlIdpFederationRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlIdpFederationAdminServiceTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSamlIdpFederationRepository federationRepository;
  @Mock private AdminAuditLogService adminAuditLogService;

  @InjectMocks private TenantSamlIdpFederationAdminService service;

  @Test
  void add_insertsFederationRow() {
    var tenantId = UUID.randomUUID();
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(new com.yunyan.saasapi.domain.entity.SysTenant()));
    var dto =
        service.add(
            new SaasPrincipal(
                UUID.randomUUID(),
                tenantId,
                null,
                "admin@test.com",
                List.of(),
                List.of(),
                null,
                null),
            tenantId,
            new CreateTenantSamlIdpFederationRequest("entity", "https://sso", "pem", 1, true));
    assertThat(dto.idpEntityId()).isEqualTo("entity");
    verify(federationRepository).insert(any(TenantSamlIdpFederation.class));
  }

  @Test
  void list_returnsMappedItems() {
    var tenantId = UUID.randomUUID();
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(new com.yunyan.saasapi.domain.entity.SysTenant()));
    var row = new TenantSamlIdpFederation();
    row.setId(UUID.randomUUID());
    row.setTenantId(tenantId);
    row.setIdpEntityId("entity");
    row.setSsoUrl("https://sso");
    row.setPriority(0);
    row.setEnabled(true);
    when(federationRepository.listByTenantId(tenantId)).thenReturn(List.of(row));
    var response = service.list(tenantId);
    assertThat(response.items()).hasSize(1);
  }
}

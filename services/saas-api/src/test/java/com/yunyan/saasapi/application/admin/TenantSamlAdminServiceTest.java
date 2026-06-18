package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlAdminServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSamlConfigRepository samlConfigRepository;

  @InjectMocks private TenantSamlAdminService service;

  @Test
  void getConfig_whenMissing_returnsEmptyDto() {
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(sampleTenant()));

    var dto = service.getConfig(TENANT_ID);

    assertThat(dto.enabled()).isFalse();
    assertThat(dto.configured()).isFalse();
  }

  private static SysTenant sampleTenant() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    tenant.setSlug("demo");
    return tenant;
  }
}

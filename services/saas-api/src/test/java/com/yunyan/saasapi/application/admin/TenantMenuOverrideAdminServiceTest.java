package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.WorkspaceMenuRepository;
import com.yunyan.saasapi.domain.WorkspaceMenuTenantOverrideRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuTenantOverride;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.PostTenantMenuOverrideBatchRequest;
import com.yunyan.saasapi.web.dto.admin.PutTenantMenuOverrideRequest;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantMenuOverrideAdminServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("11111111-1111-1111-1111-111111111101");

  @Mock private TenantRepository tenantRepository;
  @Mock private WorkspaceMenuRepository workspaceMenuRepository;
  @Mock private WorkspaceMenuTenantOverrideRepository overrideRepository;
  @Mock private AdminAuditLogService adminAuditLogService;

  @InjectMocks private TenantMenuOverrideAdminService service;

  @Test
  void batchUpsert_returnsAllOverrides() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));
    when(workspaceMenuRepository.itemExists("tool-measure-distance")).thenReturn(true);
    when(workspaceMenuRepository.itemExists("tool-measure-area")).thenReturn(true);
    when(overrideRepository.findByTenantIdAndItemId(eq(TENANT_ID), any())).thenReturn(Optional.empty());

    var principal =
        new SaasPrincipal(
            UUID.randomUUID(),
            TENANT_ID,
            null,
            "admin@test.local",
            List.of("PLATFORM_ADMIN"),
            List.of("admin:tenants:write"),
            null,
            Instant.now());
    var request =
        new PostTenantMenuOverrideBatchRequest(
            List.of(
                new PutTenantMenuOverrideRequest("tool-measure-distance", false, null, null),
                new PutTenantMenuOverrideRequest("tool-measure-area", null, 99, "Custom")));

    var response = service.batchUpsert(principal, TENANT_ID, request);

    assertThat(response.overrides()).hasSize(2);
    verify(adminAuditLogService)
        .recordTenantAction(principal, "tenant.menu_override.batch_upsert", TENANT_ID, "count=2");
  }
}

package com.yunyan.saasapi.application.admin;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TrialExpiredTenantSuspendServiceTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSessionRevocationService tenantSessionRevocationService;

  @InjectMocks private TrialExpiredTenantSuspendService service;

  @Test
  void suspendDueToTrialExpiry_suspendsAndRevokesSessions() {
    var tenantId = UUID.randomUUID();
    var now = Instant.parse("2026-06-18T00:00:00Z");
    var tenant = new SysTenant();
    tenant.setId(tenantId);
    tenant.setStatus("active");
    tenant.setTrialEndsAt(Instant.parse("2026-06-17T00:00:00Z"));
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
    when(tenantSessionRevocationService.revokeAllMemberSessions(tenantId)).thenReturn(2);

    var suspended = service.suspendDueToTrialExpiry(tenantId, now);

    Assertions.assertTrue(suspended);
    Assertions.assertEquals("suspended", tenant.getStatus());
    verify(tenantRepository).update(tenant);
    verify(tenantSessionRevocationService).revokeAllMemberSessions(tenantId);
  }

  @Test
  void suspendDueToTrialExpiry_skipsWhenTrialStillActive() {
    var tenantId = UUID.randomUUID();
    var now = Instant.parse("2026-06-18T00:00:00Z");
    var tenant = new SysTenant();
    tenant.setId(tenantId);
    tenant.setStatus("active");
    tenant.setTrialEndsAt(Instant.parse("2026-06-19T00:00:00Z"));
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

    var suspended = service.suspendDueToTrialExpiry(tenantId, now);

    Assertions.assertFalse(suspended);
  }
}

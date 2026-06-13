package com.yunyan.saasapi.application.email;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityNotificationService {

  private final EmailDeliveryService emailDeliveryService;
  private final TenantRepository tenantRepository;

  public void notifyPasswordChanged(SysUser user) {
    var tenant = loadTenant(user.getTenantId());
    emailDeliveryService.queuePasswordChangedEmail(
        tenant.getId(), user.getId(), user.getEmail(), tenant.getName());
  }

  public void notifyPasswordChanged(UUID userId, UUID tenantId, String email) {
    var tenant = loadTenant(tenantId);
    emailDeliveryService.queuePasswordChangedEmail(tenant.getId(), userId, email, tenant.getName());
  }

  public void notifyAccountDisabled(SysUser user) {
    var tenant = loadTenant(user.getTenantId());
    emailDeliveryService.queueAccountDisabledEmail(
        tenant.getId(), user.getId(), user.getEmail(), tenant.getName());
  }

  private SysTenant loadTenant(UUID tenantId) {
    return tenantRepository
        .findById(tenantId)
        .orElseThrow(() -> new IllegalStateException("Tenant not found for security notification"));
  }
}

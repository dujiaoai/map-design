package com.yunyan.saasapi.application.uav;

import com.yunyan.saasapi.domain.UavDockRepository;
import com.yunyan.saasapi.domain.entity.UavDock;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.uav.UavDockDto;
import com.yunyan.saasapi.web.dto.uav.UavDockListResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UavDockService {

  private final UavDockRepository uavDockRepository;

  public UavDockListResponse listForCurrentTenant(SaasPrincipal principal) {
    var tenantId = requireTenantId(principal);
    var docks = uavDockRepository.findByTenantId(tenantId);
    return new UavDockListResponse(docks.stream().map(this::toDto).toList());
  }

  public UavDockDto getById(SaasPrincipal principal, UUID dockId) {
    var tenantId = requireTenantId(principal);
    return toDto(requireDockForTenant(dockId, tenantId));
  }

  private UavDock requireDockForTenant(UUID dockId, UUID tenantId) {
    var dock =
        uavDockRepository
            .findById(dockId)
            .orElseThrow(() -> AuthException.notFound("UAV dock not found"));
    if (!tenantId.equals(dock.getTenantId())) {
      throw AuthException.notFound("UAV dock not found");
    }
    return dock;
  }

  private UavDockDto toDto(UavDock dock) {
    return new UavDockDto(
        dock.getId().toString(),
        dock.getName(),
        dock.getLocationLabel(),
        dock.getDroneCount() != null ? dock.getDroneCount() : 0,
        normalizeStatus(dock.getStatus()),
        dock.getBatteryPercent(),
        dock.getSortOrder() != null ? dock.getSortOrder() : 0);
  }

  private static String normalizeStatus(String status) {
    if (status == null || status.isBlank()) {
      return "offline";
    }
    return status.trim().toLowerCase();
  }

  private static UUID requireTenantId(SaasPrincipal principal) {
    if (principal == null || principal.effectiveTenantId() == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    return principal.effectiveTenantId();
  }
}

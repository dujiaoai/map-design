package com.yunyan.saasapi.application.map;

import com.yunyan.saasapi.domain.MapLayerRepository;
import com.yunyan.saasapi.domain.entity.MapLayer;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.map.LayerDto;
import com.yunyan.saasapi.web.dto.map.LayerListResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LayerService {

  private final MapLayerRepository mapLayerRepository;

  public LayerListResponse listForCurrentTenant(SaasPrincipal principal) {
    requirePrincipal(principal);
    var layers = mapLayerRepository.findByTenantId(principal.tenantId());
    return new LayerListResponse(layers.stream().map(this::toDto).toList());
  }

  private LayerDto toDto(MapLayer layer) {
    return new LayerDto(
        layer.getId().toString(),
        layer.getName(),
        layer.getLayerType(),
        Boolean.TRUE.equals(layer.getVisible()),
        layer.getSortOrder() != null ? layer.getSortOrder() : 0);
  }

  private void requirePrincipal(SaasPrincipal principal) {
    if (principal == null || principal.tenantId() == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
  }
}

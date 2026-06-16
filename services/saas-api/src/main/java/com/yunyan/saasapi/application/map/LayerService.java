package com.yunyan.saasapi.application.map;

import com.yunyan.saasapi.domain.MapLayerRepository;
import com.yunyan.saasapi.domain.entity.MapLayer;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.map.CreateLayerRequest;
import com.yunyan.saasapi.web.dto.map.LayerDto;
import com.yunyan.saasapi.web.dto.map.LayerListResponse;
import com.yunyan.saasapi.web.dto.map.UpdateLayerRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LayerService {

  private final MapLayerRepository mapLayerRepository;

  public LayerListResponse listForCurrentTenant(SaasPrincipal principal) {
    var tenantId = requireTenantId(principal);
    var layers = mapLayerRepository.findByTenantId(tenantId);
    return new LayerListResponse(layers.stream().map(this::toDto).toList());
  }

  public LayerDto getById(SaasPrincipal principal, UUID layerId) {
    var tenantId = requireTenantId(principal);
    return toDto(requireLayerForTenant(layerId, tenantId));
  }

  @Transactional
  public LayerDto create(SaasPrincipal principal, CreateLayerRequest request) {
    var tenantId = requireTenantId(principal);
    var layer = new MapLayer();
    layer.setId(UUID.randomUUID());
    layer.setTenantId(tenantId);
    layer.setName(request.name().trim());
    layer.setLayerType(request.layerType().trim());
    layer.setVisible(request.visible() == null || request.visible());
    layer.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
    layer.setCreatedAt(Instant.now());
    mapLayerRepository.insert(layer);
    return toDto(layer);
  }

  @Transactional
  public LayerDto update(SaasPrincipal principal, UUID layerId, UpdateLayerRequest request) {
    var tenantId = requireTenantId(principal);
    var layer = requireLayerForTenant(layerId, tenantId);
    layer.setName(request.name().trim());
    layer.setLayerType(request.layerType().trim());
    layer.setVisible(request.visible());
    layer.setSortOrder(request.sortOrder());
    mapLayerRepository.update(layer);
    return toDto(layer);
  }

  @Transactional
  public void delete(SaasPrincipal principal, UUID layerId) {
    var tenantId = requireTenantId(principal);
    requireLayerForTenant(layerId, tenantId);
    mapLayerRepository.deleteById(layerId);
  }

  private MapLayer requireLayerForTenant(UUID layerId, UUID tenantId) {
    var layer =
        mapLayerRepository
            .findById(layerId)
            .orElseThrow(() -> AuthException.notFound("Layer not found"));
    if (!tenantId.equals(layer.getTenantId())) {
      throw AuthException.notFound("Layer not found");
    }
    return layer;
  }

  private LayerDto toDto(MapLayer layer) {
    return new LayerDto(
        layer.getId().toString(),
        layer.getName(),
        layer.getLayerType(),
        Boolean.TRUE.equals(layer.getVisible()),
        layer.getSortOrder() != null ? layer.getSortOrder() : 0);
  }

  private static UUID requireTenantId(SaasPrincipal principal) {
    if (principal == null || principal.effectiveTenantId() == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    return principal.effectiveTenantId();
  }
}

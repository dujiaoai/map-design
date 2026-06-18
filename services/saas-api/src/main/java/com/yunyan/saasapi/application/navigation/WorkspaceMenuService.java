package com.yunyan.saasapi.application.navigation;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.WorkspaceMenuRepository;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuItem;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuSection;
import com.yunyan.saasapi.domain.navigation.WorkspaceMenuCatalog;
import com.yunyan.saasapi.domain.navigation.WorkspaceMenuCatalog.MenuItemDef;
import com.yunyan.saasapi.domain.navigation.WorkspaceMenuCatalog.SectionDef;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.navigation.MenuItemDto;
import com.yunyan.saasapi.web.dto.navigation.MenuSectionDto;
import com.yunyan.saasapi.web.dto.navigation.MenusResponse;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class WorkspaceMenuService {

  private final TenantRepository tenantRepository;
  private final WorkspaceMenuRepository workspaceMenuRepository;

  public MenusResponse getMenusForCurrentTenant(SaasPrincipal principal) {
    requirePrincipal(principal);
    var tenantId = principal.tenantId();
    if (tenantId == null) {
      throw AuthException.badRequest("Tenant context is required");
    }
    var enabledFeatures = loadEnabledFeatures(tenantId);
    var userPermissions = new LinkedHashSet<>(principal.permissionCodes());

    if (workspaceMenuRepository.hasPersistedData()) {
      return buildFromDatabase(enabledFeatures, userPermissions);
    }
    return buildFromCatalog(enabledFeatures, userPermissions);
  }

  private MenusResponse buildFromDatabase(Set<String> enabledFeatures, Set<String> userPermissions) {
    var sections = new ArrayList<MenuSectionDto>();
    var flatItems = new LinkedHashSet<String>();
    var items = new ArrayList<MenuItemDto>();

    for (WorkspaceMenuSection section : workspaceMenuRepository.findEnabledSectionsOrdered()) {
      var visibleItems =
          workspaceMenuRepository.findEnabledItemsBySection(section.getId()).stream()
              .filter(item -> isVisible(item.getTenantFeature(), enabledFeatures))
              .filter(item -> hasPermission(item.getPermissionCode(), userPermissions))
              .toList();
      if (visibleItems.isEmpty()) {
        continue;
      }
      var itemDtos = visibleItems.stream().map(this::toDto).toList();
      sections.add(
          new MenuSectionDto(
              section.getId(),
              section.getLabel(),
              Boolean.TRUE.equals(section.getCollapsible()),
              section.getDefaultOpen() == null || section.getDefaultOpen(),
              section.getStorageKey(),
              itemDtos));
      for (MenuItemDto dto : itemDtos) {
        if (flatItems.add(dto.id())) {
          items.add(dto);
        }
      }
    }

    for (WorkspaceMenuItem tool : workspaceMenuRepository.findEnabledToolItemsOrdered()) {
      if (!isVisible(tool.getTenantFeature(), enabledFeatures)) {
        continue;
      }
      if (!hasPermission(tool.getPermissionCode(), userPermissions)) {
        continue;
      }
      var dto = toDto(tool);
      if (flatItems.add(dto.id())) {
        items.add(dto);
      }
    }

    return new MenusResponse(List.copyOf(sections), List.copyOf(items));
  }

  private MenusResponse buildFromCatalog(Set<String> enabledFeatures, Set<String> userPermissions) {
    var sections = new ArrayList<MenuSectionDto>();
    var flatItems = new LinkedHashSet<String>();
    var items = new ArrayList<MenuItemDto>();

    for (SectionDef section : WorkspaceMenuCatalog.SIDEBAR_SECTIONS) {
      var visibleItems =
          section.items().stream()
              .filter(item -> isVisible(item, enabledFeatures))
              .filter(item -> hasPermission(null, userPermissions))
              .toList();
      if (visibleItems.isEmpty()) {
        continue;
      }
      var itemDtos = visibleItems.stream().map(this::toDto).toList();
      sections.add(
          new MenuSectionDto(
              section.id(),
              section.label(),
              section.collapsible(),
              section.defaultOpen(),
              section.storageKey(),
              itemDtos));
      for (MenuItemDto dto : itemDtos) {
        if (flatItems.add(dto.id())) {
          items.add(dto);
        }
      }
    }

    for (MenuItemDef tool : WorkspaceMenuCatalog.TOOL_ITEMS) {
      if (!isVisible(tool, enabledFeatures)) {
        continue;
      }
      if (!hasPermission(null, userPermissions)) {
        continue;
      }
      var dto = toDto(tool);
      if (flatItems.add(dto.id())) {
        items.add(dto);
      }
    }

    return new MenusResponse(List.copyOf(sections), List.copyOf(items));
  }

  private Set<String> loadEnabledFeatures(UUID tenantId) {
    return new LinkedHashSet<>(tenantRepository.findFeatureCodes(tenantId));
  }

  private static boolean isVisible(MenuItemDef item, Set<String> enabledFeatures) {
    return isVisible(item.tenantFeature(), enabledFeatures);
  }

  private static boolean isVisible(String tenantFeature, Set<String> enabledFeatures) {
    if (!StringUtils.hasText(tenantFeature)) {
      return true;
    }
    return enabledFeatures.contains(tenantFeature);
  }

  static boolean hasPermission(String permissionCode, Set<String> userPermissions) {
    if (!StringUtils.hasText(permissionCode)) {
      return true;
    }
    return userPermissions.contains(permissionCode);
  }

  private MenuItemDto toDto(MenuItemDef item) {
    return new MenuItemDto(
        item.id(),
        item.title(),
        item.kind(),
        item.icon(),
        item.toolId(),
        item.moduleId(),
        item.url(),
        item.href(),
        null);
  }

  private MenuItemDto toDto(WorkspaceMenuItem item) {
    return new MenuItemDto(
        item.getId(),
        item.getTitle(),
        item.getKind(),
        item.getIcon(),
        item.getToolId(),
        item.getModuleId(),
        item.getUrl(),
        item.getHref(),
        item.getPermissionCode());
  }

  private static void requirePrincipal(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
  }
}

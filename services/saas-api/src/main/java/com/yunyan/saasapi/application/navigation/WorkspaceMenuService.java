package com.yunyan.saasapi.application.navigation;

import com.yunyan.saasapi.domain.TenantRepository;
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

  public MenusResponse getMenusForCurrentTenant(SaasPrincipal principal) {
    requirePrincipal(principal);
    var tenantId = principal.tenantId();
    if (tenantId == null) {
      throw AuthException.badRequest("Tenant context is required");
    }
    var enabledFeatures = loadEnabledFeatures(tenantId);

    var sections = new ArrayList<MenuSectionDto>();
    var flatItems = new LinkedHashSet<String>();
    var items = new ArrayList<MenuItemDto>();

    for (SectionDef section : WorkspaceMenuCatalog.SIDEBAR_SECTIONS) {
      var visibleItems =
          section.items().stream().filter(item -> isVisible(item, enabledFeatures)).toList();
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
    if (!StringUtils.hasText(item.tenantFeature())) {
      return true;
    }
    return enabledFeatures.contains(item.tenantFeature());
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
        item.href());
  }

  private static void requirePrincipal(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
  }
}

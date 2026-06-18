package com.yunyan.saasapi.application.navigation;

import com.yunyan.saasapi.application.admin.AdminAuditLogService;
import com.yunyan.saasapi.domain.WorkspaceMenuRepository;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuItem;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuSection;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminMenuItemDto;
import com.yunyan.saasapi.web.dto.admin.AdminMenuItemUpdateDto;
import com.yunyan.saasapi.web.dto.admin.AdminMenuSectionDto;
import com.yunyan.saasapi.web.dto.admin.AdminMenuSectionUpdateDto;
import com.yunyan.saasapi.web.dto.admin.AdminMenusResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateWorkspaceMenusRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class WorkspaceMenuAdminService {

  private final WorkspaceMenuRepository workspaceMenuRepository;
  private final AdminAuditLogService adminAuditLogService;

  public AdminMenusResponse getMenus() {
    var sections = workspaceMenuRepository.findAllSectionsOrdered();
    var items = workspaceMenuRepository.findAllItemsOrdered();
    var itemsBySection =
        items.stream()
            .filter(item -> StringUtils.hasText(item.getSectionId()))
            .collect(Collectors.groupingBy(WorkspaceMenuItem::getSectionId));
    var toolItems =
        items.stream().filter(item -> !StringUtils.hasText(item.getSectionId())).toList();

    var sectionDtos =
        sections.stream()
            .map(
                section ->
                    toSectionDto(
                        section, itemsBySection.getOrDefault(section.getId(), List.of())))
            .toList();
    return new AdminMenusResponse(sectionDtos, toolItems.stream().map(this::toItemDto).toList());
  }

  @Transactional
  public AdminMenusResponse replaceMenus(SaasPrincipal principal, UpdateWorkspaceMenusRequest request) {
    var existingSections = indexSections(workspaceMenuRepository.findAllSectionsOrdered());
    var existingItems = indexItems(workspaceMenuRepository.findAllItemsOrdered());
    validateRequest(request, existingSections, existingItems);

    for (AdminMenuSectionUpdateDto sectionUpdate : request.sections()) {
      var section = existingSections.get(sectionUpdate.id());
      section.setLabel(sectionUpdate.label().trim());
      section.setSortOrder(sectionUpdate.sortOrder());
      section.setEnabled(sectionUpdate.enabled());
      workspaceMenuRepository.updateSection(section);

      for (AdminMenuItemUpdateDto itemUpdate : sectionUpdate.items()) {
        applyItemUpdate(existingItems.get(itemUpdate.id()), itemUpdate);
      }
    }

    for (AdminMenuItemUpdateDto toolUpdate : request.toolItems()) {
      applyItemUpdate(existingItems.get(toolUpdate.id()), toolUpdate);
    }

    adminAuditLogService.recordPlatformUserAction(
        principal,
        "workspace.menu.update",
        null,
        "sections="
            + request.sections().size()
            + " toolItems="
            + request.toolItems().size());
    return getMenus();
  }

  private void applyItemUpdate(WorkspaceMenuItem item, AdminMenuItemUpdateDto update) {
    item.setTitle(update.title().trim());
    item.setSortOrder(update.sortOrder());
    item.setEnabled(update.enabled());
    workspaceMenuRepository.updateItem(item);
  }

  private static void validateRequest(
      UpdateWorkspaceMenusRequest request,
      Map<String, WorkspaceMenuSection> existingSections,
      Map<String, WorkspaceMenuItem> existingItems) {
    if (request.sections().size() != existingSections.size()) {
      throw AuthException.badRequest("Section count must match existing catalog");
    }

    var seenSectionIds = new HashSet<String>();
    for (AdminMenuSectionUpdateDto sectionUpdate : request.sections()) {
      if (!existingSections.containsKey(sectionUpdate.id())) {
        throw AuthException.badRequest("Unknown section id: " + sectionUpdate.id());
      }
      if (!seenSectionIds.add(sectionUpdate.id())) {
        throw AuthException.badRequest("Duplicate section id: " + sectionUpdate.id());
      }
      validateSectionItems(sectionUpdate, existingItems);
    }

    if (!seenSectionIds.equals(existingSections.keySet())) {
      throw AuthException.badRequest("Section ids must match existing catalog");
    }

    var toolIds =
        existingItems.values().stream()
            .filter(item -> !StringUtils.hasText(item.getSectionId()))
            .map(WorkspaceMenuItem::getId)
            .collect(Collectors.toSet());
    if (request.toolItems().size() != toolIds.size()) {
      throw AuthException.badRequest("Tool item count must match existing catalog");
    }

    var seenToolIds = new HashSet<String>();
    for (AdminMenuItemUpdateDto toolUpdate : request.toolItems()) {
      var existing = existingItems.get(toolUpdate.id());
      if (existing == null || StringUtils.hasText(existing.getSectionId())) {
        throw AuthException.badRequest("Unknown tool item id: " + toolUpdate.id());
      }
      if (!seenToolIds.add(toolUpdate.id())) {
        throw AuthException.badRequest("Duplicate tool item id: " + toolUpdate.id());
      }
    }

    if (!seenToolIds.equals(toolIds)) {
      throw AuthException.badRequest("Tool item ids must match existing catalog");
    }
  }

  private static void validateSectionItems(
      AdminMenuSectionUpdateDto sectionUpdate, Map<String, WorkspaceMenuItem> existingItems) {
    var expectedIds =
        existingItems.values().stream()
            .filter(item -> sectionUpdate.id().equals(item.getSectionId()))
            .map(WorkspaceMenuItem::getId)
            .collect(Collectors.toSet());
    if (sectionUpdate.items().size() != expectedIds.size()) {
      throw AuthException.badRequest(
          "Item count for section " + sectionUpdate.id() + " must match existing catalog");
    }

    var seenItemIds = new HashSet<String>();
    for (AdminMenuItemUpdateDto itemUpdate : sectionUpdate.items()) {
      var existing = existingItems.get(itemUpdate.id());
      if (existing == null || !sectionUpdate.id().equals(existing.getSectionId())) {
        throw AuthException.badRequest("Unknown item id for section: " + itemUpdate.id());
      }
      if (!seenItemIds.add(itemUpdate.id())) {
        throw AuthException.badRequest("Duplicate item id: " + itemUpdate.id());
      }
    }

    if (!seenItemIds.equals(expectedIds)) {
      throw AuthException.badRequest(
          "Item ids for section " + sectionUpdate.id() + " must match existing catalog");
    }
  }

  private static Map<String, WorkspaceMenuSection> indexSections(List<WorkspaceMenuSection> sections) {
    var map = new HashMap<String, WorkspaceMenuSection>();
    for (WorkspaceMenuSection section : sections) {
      map.put(section.getId(), section);
    }
    return map;
  }

  private static Map<String, WorkspaceMenuItem> indexItems(List<WorkspaceMenuItem> items) {
    var map = new HashMap<String, WorkspaceMenuItem>();
    for (WorkspaceMenuItem item : items) {
      map.put(item.getId(), item);
    }
    return map;
  }

  private AdminMenuSectionDto toSectionDto(WorkspaceMenuSection section, List<WorkspaceMenuItem> items) {
    var sortedItems = new ArrayList<>(items);
    sortedItems.sort(
        (left, right) -> {
          var orderCompare =
              Integer.compare(
                  left.getSortOrder() == null ? 0 : left.getSortOrder(),
                  right.getSortOrder() == null ? 0 : right.getSortOrder());
          if (orderCompare != 0) {
            return orderCompare;
          }
          return left.getId().compareTo(right.getId());
        });
    return new AdminMenuSectionDto(
        section.getId(),
        section.getLabel(),
        Boolean.TRUE.equals(section.getCollapsible()),
        section.getDefaultOpen() == null || section.getDefaultOpen(),
        section.getStorageKey(),
        section.getSortOrder() == null ? 0 : section.getSortOrder(),
        section.getEnabled() == null || section.getEnabled(),
        sortedItems.stream().map(this::toItemDto).toList());
  }

  private AdminMenuItemDto toItemDto(WorkspaceMenuItem item) {
    return new AdminMenuItemDto(
        item.getId(),
        item.getSectionId(),
        item.getTitle(),
        item.getKind(),
        item.getIcon(),
        item.getToolId(),
        item.getModuleId(),
        item.getUrl(),
        item.getHref(),
        item.getTenantFeature(),
        item.getPermissionCode(),
        item.getSortOrder() == null ? 0 : item.getSortOrder(),
        item.getEnabled() == null || item.getEnabled());
  }
}

package com.yunyan.saasapi.application.navigation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yunyan.saasapi.domain.entity.WorkspaceMenuItem;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuTenantOverride;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class WorkspaceMenuTenantOverrideMergeTest {

  @Test
  void isEffectiveEnabled_honorsOverrideDisable() {
    var item = new WorkspaceMenuItem();
    item.setId("tool-a");
    item.setEnabled(true);
    var override = new WorkspaceMenuTenantOverride();
    override.setItemId("tool-a");
    override.setEnabled(false);
    assertFalse(WorkspaceMenuService.isEffectiveEnabled(item, Map.of("tool-a", override)));
  }

  @Test
  void effectiveTitle_usesOverrideTitle() {
    var item = new WorkspaceMenuItem();
    item.setId("tool-a");
    item.setTitle("Template");
    var override = new WorkspaceMenuTenantOverride();
    override.setItemId("tool-a");
    override.setTitle("Custom");
    assertTrue(
        WorkspaceMenuService.effectiveTitle(item, Map.of("tool-a", override)).contains("Custom"));
  }

  @Test
  void effectiveSortOrder_usesOverrideValue() {
    var item = new WorkspaceMenuItem();
    item.setId("tool-a");
    item.setSortOrder(10);
    var override = new WorkspaceMenuTenantOverride();
    override.setItemId("tool-a");
    override.setSortOrder(3);
    org.junit.jupiter.api.Assertions.assertEquals(
        3, WorkspaceMenuService.effectiveSortOrder(item, Map.of("tool-a", override)));
  }
}

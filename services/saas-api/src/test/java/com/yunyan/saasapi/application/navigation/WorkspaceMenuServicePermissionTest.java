package com.yunyan.saasapi.application.navigation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import org.junit.jupiter.api.Test;

class WorkspaceMenuServicePermissionTest {

  @Test
  void hasPermission_blankCode_allowsAll() {
    assertTrue(WorkspaceMenuService.hasPermission(null, Set.of()));
    assertTrue(WorkspaceMenuService.hasPermission("", Set.of()));
  }

  @Test
  void hasPermission_requiresMatchingCode() {
    assertTrue(
        WorkspaceMenuService.hasPermission(
            "workspace:map:write", Set.of("workspace:use", "workspace:map:write")));
    assertFalse(
        WorkspaceMenuService.hasPermission("workspace:map:write", Set.of("workspace:use")));
  }
}

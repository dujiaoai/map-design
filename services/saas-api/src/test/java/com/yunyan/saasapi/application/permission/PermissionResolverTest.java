package com.yunyan.saasapi.application.permission;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.domain.permission.PermissionCodes;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PermissionResolverTest {

  @Autowired
  PermissionResolver permissionResolver;

  @Test
  void resolveByRoleCodes_mergesPermissionsForMultipleRoles() {
    assertThat(permissionResolver.resolveByRoleCodes(List.of("MEMBER", "VIEWER")))
        .containsExactlyInAnyOrder(
            PermissionCodes.WORKSPACE_USE,
            PermissionCodes.WORKSPACE_MAP_READ,
            PermissionCodes.WORKSPACE_MAP_WRITE,
            PermissionCodes.BILLING_WALLET_READ,
            PermissionCodes.BILLING_LEDGER_READ,
            PermissionCodes.BILLING_RECHARGE_CREATE);
  }

  @Test
  void resolveByRoleCodes_platformAdminHasPlatformScopeOnly() {
    assertThat(permissionResolver.resolveByRoleCodes(List.of("PLATFORM_ADMIN")))
        .contains(PermissionCodes.ADMIN_TENANTS_READ, PermissionCodes.ADMIN_USERS_WRITE)
        .doesNotContain(PermissionCodes.WORKSPACE_MAP_WRITE);
  }
}

package com.yunyan.saasapi.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.domain.entity.SysPermission;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.mapper.SysPermissionMapper;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PermissionSchemaMigrationTest {

  private static final UUID PLATFORM_ADMIN_ROLE_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000001");
  private static final UUID TENANT_ADMIN_ROLE_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000002");
  private static final UUID MEMBER_ROLE_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000003");
  private static final UUID VIEWER_ROLE_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000004");

  @Autowired
  SysPermissionMapper sysPermissionMapper;

  @Autowired
  SysRoleMapper sysRoleMapper;

  @Autowired
  PermissionRepository permissionRepository;

  @Test
  void flyway_seedsPermissionCatalog() {
    List<SysPermission> permissions = sysPermissionMapper.selectList(null);
    assertThat(permissions).hasSize(11);
    assertThat(permissions).extracting(SysPermission::getCode)
        .contains(
            PermissionCodes.ADMIN_TENANTS_READ,
            PermissionCodes.WORKSPACE_MAP_READ);
  }

  @Test
  void platformAdminRole_hasPlatformPermissions() {
    List<String> codes = permissionRepository.findPermissionCodesByRoleId(PLATFORM_ADMIN_ROLE_ID);
    assertThat(codes)
        .contains(
            PermissionCodes.ADMIN_TENANTS_READ,
            PermissionCodes.ADMIN_TENANTS_WRITE,
            PermissionCodes.ADMIN_ROLES_WRITE)
        .doesNotContain(PermissionCodes.WORKSPACE_MAP_WRITE);
  }

  @Test
  void tenantAdminRole_hasTenantAndWorkspacePermissions() {
    List<String> codes = permissionRepository.findPermissionCodesByRoleId(TENANT_ADMIN_ROLE_ID);
    assertThat(codes)
        .contains(
            PermissionCodes.ADMIN_MEMBERS_READ,
            PermissionCodes.ADMIN_MEMBERS_WRITE,
            PermissionCodes.WORKSPACE_MAP_WRITE)
        .doesNotContain(PermissionCodes.ADMIN_TENANTS_WRITE);
  }

  @Test
  void memberRole_hasWorkspaceWrite() {
    List<String> codes = permissionRepository.findPermissionCodesByRoleId(MEMBER_ROLE_ID);
    assertThat(codes)
        .containsExactlyInAnyOrder(
            PermissionCodes.WORKSPACE_USE,
            PermissionCodes.WORKSPACE_MAP_READ,
            PermissionCodes.WORKSPACE_MAP_WRITE);
  }

  @Test
  void viewerRole_isReadOnlyWorkspace() {
    List<String> codes = permissionRepository.findPermissionCodesByRoleId(VIEWER_ROLE_ID);
    assertThat(codes)
        .containsExactlyInAnyOrder(
            PermissionCodes.WORKSPACE_USE, PermissionCodes.WORKSPACE_MAP_READ)
        .doesNotContain(PermissionCodes.WORKSPACE_MAP_WRITE);
  }

  @Test
  void rolesStillSeededFromV3() {
    assertThat(sysRoleMapper.selectList(null)).extracting(SysRole::getCode)
        .containsExactlyInAnyOrder(
            "PLATFORM_ADMIN", "TENANT_ADMIN", "MEMBER", "VIEWER");
  }
}

package com.yunyan.saasapi.domain.permission;

/** Stable permission codes seeded in V6__permissions.sql; used by admin API and @PreAuthorize (D-02+). */
public final class PermissionCodes {

  public static final String ADMIN_TENANTS_READ = "admin:tenants:read";
  public static final String ADMIN_TENANTS_WRITE = "admin:tenants:write";
  public static final String ADMIN_USERS_READ = "admin:users:read";
  public static final String ADMIN_USERS_WRITE = "admin:users:write";
  public static final String ADMIN_ROLES_READ = "admin:roles:read";
  public static final String ADMIN_ROLES_WRITE = "admin:roles:write";
  public static final String ADMIN_MEMBERS_READ = "admin:members:read";
  public static final String ADMIN_MEMBERS_WRITE = "admin:members:write";
  public static final String WORKSPACE_USE = "workspace:use";
  public static final String WORKSPACE_MAP_READ = "workspace:map:read";
  public static final String WORKSPACE_MAP_WRITE = "workspace:map:write";

  /** Platform-scoped permissions; any one grants access to `/v1/admin/**` (D-02). */
  public static final String[] PLATFORM_ADMIN_AUTHORITIES = {
    ADMIN_TENANTS_READ,
    ADMIN_TENANTS_WRITE,
    ADMIN_USERS_READ,
    ADMIN_USERS_WRITE,
    ADMIN_ROLES_READ,
    ADMIN_ROLES_WRITE
  };

  private PermissionCodes() {}
}

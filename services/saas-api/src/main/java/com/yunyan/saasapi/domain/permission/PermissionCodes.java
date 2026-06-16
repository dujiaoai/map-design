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

  public static final String BILLING_WALLET_READ = "billing:wallet:read";
  public static final String BILLING_LEDGER_READ = "billing:ledger:read";
  public static final String BILLING_RECHARGE_CREATE = "billing:recharge:create";
  public static final String BILLING_USAGE_READ = "billing:usage:read";
  public static final String BILLING_TRANSFER_CREATE = "billing:transfer:create";
  public static final String ADMIN_BILLING_READ = "admin:billing:read";
  public static final String ADMIN_BILLING_ADJUST = "admin:billing:adjust";
  public static final String ADMIN_BILLING_PACKAGES_WRITE = "admin:billing:packages:write";
  public static final String ADMIN_BILLING_REFUND = "admin:billing:refund";
  public static final String ADMIN_AUDIT_READ = "admin:audit:read";
  public static final String ADMIN_AUDIT_EXPORT = "admin:audit:export";
  public static final String ADMIN_MENUS_READ = "admin:menus:read";
  public static final String ADMIN_MENUS_WRITE = "admin:menus:write";
  public static final String ADMIN_IMPERSONATE = "admin:impersonate";

  /** Requires explicit audit permission (no tenants:read fallback). */
  public static final String ADMIN_AUDIT_READ_AUTHORITIES =
      "hasAuthority('" + ADMIN_AUDIT_READ + "')";

  public static final String ADMIN_AUDIT_EXPORT_AUTHORITIES =
      "hasAuthority('" + ADMIN_AUDIT_EXPORT + "')";

  /** Platform-scoped permissions; any one grants access to `/v1/admin/**` (D-02). */
  public static final String[] PLATFORM_ADMIN_AUTHORITIES = {
    ADMIN_TENANTS_READ,
    ADMIN_TENANTS_WRITE,
    ADMIN_USERS_READ,
    ADMIN_USERS_WRITE,
    ADMIN_ROLES_READ,
    ADMIN_ROLES_WRITE,
    ADMIN_AUDIT_READ,
    ADMIN_AUDIT_EXPORT,
    ADMIN_MENUS_READ,
    ADMIN_MENUS_WRITE,
    ADMIN_IMPERSONATE,
    ADMIN_BILLING_READ,
    ADMIN_BILLING_ADJUST,
    ADMIN_BILLING_PACKAGES_WRITE,
    ADMIN_BILLING_REFUND
  };

  /** Tenant-scoped permissions for `/v1/admin/**` member routes (D-06). */
  public static final String[] TENANT_MEMBER_ADMIN_AUTHORITIES = {
    ADMIN_MEMBERS_READ,
    ADMIN_MEMBERS_WRITE
  };

  /** Any authority that may enter `/v1/admin/**` (except permitAll ping). */
  public static final String[] ADMIN_GATE_AUTHORITIES = {
    ADMIN_TENANTS_READ,
    ADMIN_TENANTS_WRITE,
    ADMIN_USERS_READ,
    ADMIN_USERS_WRITE,
    ADMIN_ROLES_READ,
    ADMIN_ROLES_WRITE,
    ADMIN_AUDIT_READ,
    ADMIN_AUDIT_EXPORT,
    ADMIN_MENUS_READ,
    ADMIN_MENUS_WRITE,
    ADMIN_IMPERSONATE,
    ADMIN_MEMBERS_READ,
    ADMIN_MEMBERS_WRITE
  };

  private PermissionCodes() {}
}

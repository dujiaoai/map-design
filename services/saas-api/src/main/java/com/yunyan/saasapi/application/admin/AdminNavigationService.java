package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.domain.product.ProductCatalog;
import com.yunyan.saasapi.web.dto.admin.AdminNavigationItemDto;
import com.yunyan.saasapi.web.dto.admin.AdminNavigationResponse;
import com.yunyan.saasapi.web.dto.admin.AdminNavigationSectionDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminNavigationService {

  public AdminNavigationResponse getNavigation(String productCode) {
    var code =
        StringUtils.hasText(productCode) ? productCode.trim() : ProductCatalog.MAP_DESIGN_CODE;
    return new AdminNavigationResponse(code, buildSections(code));
  }

  private static List<AdminNavigationSectionDto> buildSections(String productCode) {
    return List.of(
        new AdminNavigationSectionDto(
            "platform",
            "平台",
            List.of(
                item("/", "概览", "admin:tenants:read", "admin:users:read", "admin:roles:read"),
                item("/tenants", "租户", PermissionCodes.ADMIN_TENANTS_READ),
                item("/users", "用户", PermissionCodes.ADMIN_USERS_READ))),
        new AdminNavigationSectionDto(
            "collaboration",
            "协作",
            List.of(
                item("/members", "成员", PermissionCodes.ADMIN_MEMBERS_READ),
                item("/tenant-roles", "自定义角色", PermissionCodes.ADMIN_MEMBERS_READ),
                item("/roles", "系统角色", PermissionCodes.ADMIN_ROLES_READ),
                item("/permissions", "权限目录", PermissionCodes.ADMIN_ROLES_READ))),
        new AdminNavigationSectionDto(
            "operations",
            "运维",
            List.of(
                item("/audit-logs", "审计", PermissionCodes.ADMIN_AUDIT_READ),
                item("/menus", "菜单配置", PermissionCodes.ADMIN_MENUS_READ),
                item(
                    "/billing",
                    "计费",
                    PermissionCodes.ADMIN_BILLING_READ,
                    PermissionCodes.ADMIN_BILLING_ADJUST,
                    PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE,
                    PermissionCodes.ADMIN_BILLING_REFUND),
                item("/system", "系统", PermissionCodes.ADMIN_TENANTS_READ))));
  }

  private static AdminNavigationItemDto item(String to, String label, String... permissions) {
    return new AdminNavigationItemDto(to, label, List.of(permissions));
  }
}

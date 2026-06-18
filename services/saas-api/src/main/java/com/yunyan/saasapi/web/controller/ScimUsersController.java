package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.scim.ScimUserService;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.scim.ScimCreateUserRequest;
import com.yunyan.saasapi.web.dto.scim.ScimListResponse;
import com.yunyan.saasapi.web.dto.scim.ScimPatchUserRequest;
import com.yunyan.saasapi.web.dto.scim.ScimUserResource;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/scim/v2")
@RequiredArgsConstructor
@Tag(name = "SCIM", description = "Directory Sync Users CRUD（Phase 11-2）")
public class ScimUsersController {

  private final ScimUserService scimUserService;

  @GetMapping("/Users")
  @Operation(summary = "SCIM Users 列表")
  public ScimListResponse listUsers(HttpServletRequest request) {
    return scimUserService.listUsers(requireTenantId(request));
  }

  @PostMapping("/Users")
  @Operation(summary = "SCIM 创建用户")
  public ScimUserResource createUser(
      HttpServletRequest request, @RequestBody ScimCreateUserRequest body) {
    return scimUserService.createUser(requireTenantId(request), body);
  }

  @GetMapping("/Users/{id}")
  @Operation(summary = "SCIM 获取用户")
  public ScimUserResource getUser(HttpServletRequest request, @PathVariable String id) {
    return scimUserService.getUser(requireTenantId(request), id);
  }

  @PutMapping("/Users/{id}")
  @Operation(summary = "SCIM 全量更新用户")
  public ScimUserResource putUser(
      HttpServletRequest request, @PathVariable String id, @RequestBody ScimPatchUserRequest body) {
    return scimUserService.updateUser(requireTenantId(request), id, body);
  }

  @PostMapping("/Users/{id}")
  @Operation(summary = "SCIM PATCH 用户（简化 PUT 同构）")
  public ScimUserResource patchUser(
      HttpServletRequest request, @PathVariable String id, @RequestBody ScimPatchUserRequest body) {
    return scimUserService.updateUser(requireTenantId(request), id, body);
  }

  @DeleteMapping("/Users/{id}")
  @Operation(summary = "SCIM 删除用户（deprovision）")
  public void deleteUser(HttpServletRequest request, @PathVariable String id) {
    scimUserService.deleteUser(requireTenantId(request), id);
  }

  private static UUID requireTenantId(HttpServletRequest request) {
    var tenantId = request.getAttribute("scimTenantId");
    if (tenantId instanceof UUID uuid) {
      return uuid;
    }
    throw AuthException.unauthorized("SCIM tenant context missing");
  }
}

package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.scim.ScimGroupService;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.scim.ScimCreateGroupRequest;
import com.yunyan.saasapi.web.dto.scim.ScimGroupResource;
import com.yunyan.saasapi.web.dto.scim.ScimListResponse;
import com.yunyan.saasapi.web.dto.scim.ScimPatchGroupRequest;
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
public class ScimGroupsController {

  private final ScimGroupService scimGroupService;

  @GetMapping("/Groups")
  public ScimListResponse listGroups(HttpServletRequest request) {
    return scimGroupService.listGroups(requireTenantId(request));
  }

  @PostMapping("/Groups")
  public ScimGroupResource createGroup(
      HttpServletRequest request, @RequestBody ScimCreateGroupRequest body) {
    return scimGroupService.createGroup(requireTenantId(request), body);
  }

  @GetMapping("/Groups/{id}")
  public ScimGroupResource getGroup(HttpServletRequest request, @PathVariable String id) {
    return scimGroupService.getGroup(requireTenantId(request), id);
  }

  @PutMapping("/Groups/{id}")
  public ScimGroupResource putGroup(
      HttpServletRequest request, @PathVariable String id, @RequestBody ScimPatchGroupRequest body) {
    return scimGroupService.updateGroup(requireTenantId(request), id, body);
  }

  @PostMapping("/Groups/{id}")
  public ScimGroupResource patchGroup(
      HttpServletRequest request, @PathVariable String id, @RequestBody ScimPatchGroupRequest body) {
    return scimGroupService.updateGroup(requireTenantId(request), id, body);
  }

  @DeleteMapping("/Groups/{id}")
  public void deleteGroup(HttpServletRequest request, @PathVariable String id) {
    scimGroupService.deleteGroup(requireTenantId(request), id);
  }

  private static UUID requireTenantId(HttpServletRequest request) {
    var tenantId = request.getAttribute("scimTenantId");
    if (tenantId instanceof UUID uuid) {
      return uuid;
    }
    throw AuthException.unauthorized("SCIM tenant context missing");
  }
}

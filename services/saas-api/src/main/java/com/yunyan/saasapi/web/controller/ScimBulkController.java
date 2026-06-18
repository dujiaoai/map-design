package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.scim.ScimBulkService;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.scim.ScimBulkRequest;
import com.yunyan.saasapi.web.dto.scim.ScimBulkResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/scim/v2")
@RequiredArgsConstructor
@Tag(name = "SCIM", description = "Directory Sync Bulk（Phase 13-2）")
public class ScimBulkController {

  private final ScimBulkService scimBulkService;

  @PostMapping("/Bulk")
  @Operation(summary = "SCIM Bulk 批量操作", description = "支持 POST create User/Group，单批最多 20 条。")
  public ScimBulkResponse bulk(HttpServletRequest request, @RequestBody ScimBulkRequest body) {
    return scimBulkService.processBulk(requireTenantId(request), body);
  }

  private static UUID requireTenantId(HttpServletRequest request) {
    var attr = request.getAttribute("scimTenantId");
    if (attr instanceof UUID tenantId) {
      return tenantId;
    }
    throw AuthException.unauthorized("SCIM bearer token required");
  }
}

package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.map.LayerService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.map.LayerListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/layers")
@RequiredArgsConstructor
@Tag(name = "Map Layers")
@SecurityRequirement(name = "bearerAuth")
public class LayersController {

  private final LayerService layerService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.WORKSPACE_MAP_READ + "')")
  @Operation(
      summary = "列出当前租户地图图层",
      description = "按 JWT tenant_id 返回图层摘要，供专题图层等模块读取。")
  @ApiResponse(responseCode = "200", description = "图层列表")
  @ApiResponse(
      responseCode = "401",
      description = "未认证",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "403",
      description = "无 workspace:map:read 权限",
      content = @Content(mediaType = "application/problem+json"))
  public LayerListResponse list(@AuthenticationPrincipal SaasPrincipal principal) {
    return layerService.listForCurrentTenant(principal);
  }
}

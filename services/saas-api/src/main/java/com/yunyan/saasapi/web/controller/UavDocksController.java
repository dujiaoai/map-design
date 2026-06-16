package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.uav.UavDockService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.uav.UavDockDto;
import com.yunyan.saasapi.web.dto.uav.UavDockListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/uav/docks")
@RequiredArgsConstructor
@Tag(name = "UAV Docks")
@SecurityRequirement(name = "bearerAuth")
public class UavDocksController {

  private final UavDockService uavDockService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.WORKSPACE_USE + "')")
  @Operation(summary = "列出当前租户机库")
  public UavDockListResponse list(@AuthenticationPrincipal SaasPrincipal principal) {
    return uavDockService.listForCurrentTenant(principal);
  }

  @GetMapping("/{dockId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.WORKSPACE_USE + "')")
  @Operation(summary = "获取单个机库")
  public UavDockDto get(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID dockId) {
    return uavDockService.getById(principal, dockId);
  }
}

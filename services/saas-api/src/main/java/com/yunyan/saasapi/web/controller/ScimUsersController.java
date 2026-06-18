package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.web.dto.scim.ScimListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/scim/v2")
@Tag(name = "SCIM", description = "Directory Sync PoC（Phase 10-5）")
public class ScimUsersController {

  @GetMapping("/Users")
  @Operation(summary = "SCIM Users 列表（PoC）", description = "Bearer token 鉴权；当前返回空 ListResponse")
  public ScimListResponse listUsers() {
    return ScimListResponse.empty();
  }
}

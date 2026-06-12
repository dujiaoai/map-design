package com.yunyan.saasapi.web.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "平台后台 · 用户列表")
public record AdminUserListResponse(
    @Schema(description = "用户列表") List<AdminUserDto> users,
    @Schema(description = "总条数（仅分页请求返回）") Long total,
    @Schema(description = "当前页码，从 1 开始") Integer page,
    @Schema(description = "每页条数") Integer size) {

  public static AdminUserListResponse unpaged(List<AdminUserDto> users) {
    return new AdminUserListResponse(users, null, null, null);
  }

  public static AdminUserListResponse paged(
      List<AdminUserDto> users, long total, int page, int size) {
    return new AdminUserListResponse(users, total, page, size);
  }
}

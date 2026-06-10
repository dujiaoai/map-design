package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "平台后台 · 用户列表")
public record AdminUserListResponse(@Schema(description = "用户列表") List<AdminUserDto> users) {}

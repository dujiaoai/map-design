package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "平台后台 · 产品线列表")
public record AdminProductListResponse(@Schema(description = "产品线") List<AdminProductDto> products) {}

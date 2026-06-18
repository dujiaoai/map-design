package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record TenantDataExportRequestListResponse(
    List<TenantDataExportRequestDto> requests) {}

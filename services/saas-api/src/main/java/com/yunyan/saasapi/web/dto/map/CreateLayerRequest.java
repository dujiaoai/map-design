package com.yunyan.saasapi.web.dto.map;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "创建地图图层")
public record CreateLayerRequest(
    @NotBlank @Size(max = 255) @Schema(description = "显示名称", example = "专题图层") String name,
    @NotBlank @Size(max = 64) @Schema(description = "图层类型", example = "thematic") String layerType,
    @Schema(description = "是否默认可见", defaultValue = "true") Boolean visible,
    @Schema(description = "排序权重", defaultValue = "0") Integer sortOrder) {}

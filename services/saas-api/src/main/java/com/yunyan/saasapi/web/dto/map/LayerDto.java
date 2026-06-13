package com.yunyan.saasapi.web.dto.map;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "地图图层摘要")
public record LayerDto(
    @Schema(description = "图层 ID") String id,
    @Schema(description = "显示名称", example = "专题图层") String name,
    @Schema(description = "图层类型", example = "thematic") String layerType,
    @Schema(description = "是否默认可见") boolean visible,
    @Schema(description = "排序权重") int sortOrder) {}

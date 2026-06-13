package com.yunyan.saasapi.web.dto.map;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "当前租户地图图层列表")
public record LayerListResponse(@Schema(description = "图层列表") List<LayerDto> items) {}

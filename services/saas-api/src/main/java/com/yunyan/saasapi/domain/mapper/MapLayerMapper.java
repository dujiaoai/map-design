package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.MapLayer;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MapLayerMapper extends BaseMapper<MapLayer> {

  @Select(
      """
      SELECT id, tenant_id, name, layer_type, visible, sort_order, created_at
      FROM map_layer
      WHERE tenant_id = #{tenantId}
      ORDER BY sort_order ASC, name ASC
      """)
  List<MapLayer> selectByTenantId(@Param("tenantId") UUID tenantId);
}

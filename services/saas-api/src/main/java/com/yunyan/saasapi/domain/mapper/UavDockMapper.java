package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.UavDock;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UavDockMapper extends BaseMapper<UavDock> {

  @Select(
      """
      SELECT id, tenant_id, name, location_label, drone_count, status, battery_percent,
             sort_order, created_at
      FROM uav_dock
      WHERE tenant_id = #{tenantId}
      ORDER BY sort_order ASC, name ASC
      """)
  List<UavDock> selectByTenantId(@Param("tenantId") UUID tenantId);
}

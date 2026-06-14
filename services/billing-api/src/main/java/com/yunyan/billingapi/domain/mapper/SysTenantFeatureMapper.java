package com.yunyan.billingapi.domain.mapper;

import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysTenantFeatureMapper {

  @Select(
      """
      SELECT COUNT(*) > 0 FROM sys_tenant_feature
      WHERE tenant_id = #{tenantId} AND feature_code = #{featureCode}
      """)
  boolean exists(@Param("tenantId") UUID tenantId, @Param("featureCode") String featureCode);

  @Insert(
      """
      INSERT INTO sys_tenant_feature (tenant_id, feature_code)
      VALUES (#{tenantId}, #{featureCode})
      """)
  void insert(@Param("tenantId") UUID tenantId, @Param("featureCode") String featureCode);
}

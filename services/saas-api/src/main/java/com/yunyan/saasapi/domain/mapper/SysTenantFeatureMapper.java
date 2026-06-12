package com.yunyan.saasapi.domain.mapper;

import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysTenantFeatureMapper {

  @Select(
      """
      SELECT feature_code
      FROM sys_tenant_feature
      WHERE tenant_id = #{tenantId}
      ORDER BY feature_code
      """)
  List<String> selectFeatureCodesByTenantId(@Param("tenantId") UUID tenantId);

  @Delete("DELETE FROM sys_tenant_feature WHERE tenant_id = #{tenantId}")
  void deleteByTenantId(@Param("tenantId") UUID tenantId);

  @Insert(
      """
      INSERT INTO sys_tenant_feature (tenant_id, feature_code)
      VALUES (#{tenantId}, #{featureCode})
      """)
  void insert(@Param("tenantId") UUID tenantId, @Param("featureCode") String featureCode);
}

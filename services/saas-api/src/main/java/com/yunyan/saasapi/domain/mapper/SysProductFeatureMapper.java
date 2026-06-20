package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.SysProductFeature;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface SysProductFeatureMapper extends BaseMapper<SysProductFeature> {

  @Select(
      """
      SELECT code FROM sys_product_feature
      WHERE product_id = #{productId}
      ORDER BY code
      """)
  java.util.List<String> selectCodesByProductId(@Param("productId") java.util.UUID productId);
}

package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingConsumptionRule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BillingConsumptionRuleMapper {

  @Select(
      """
      SELECT id, code, product_code, points_per_unit, unit_label, status, created_at
      FROM billing_consumption_rule
      WHERE code = #{code} AND status = 'active'
      """)
  BillingConsumptionRule findActiveByCode(@Param("code") String code);
}

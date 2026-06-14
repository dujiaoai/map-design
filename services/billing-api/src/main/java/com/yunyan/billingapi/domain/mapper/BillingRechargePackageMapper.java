package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingRechargePackage;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BillingRechargePackageMapper {

  @Select(
      """
      SELECT id, code, points, price_cents, currency, status, sort_order, created_at
      FROM billing_recharge_package
      WHERE status = 'active'
      ORDER BY sort_order ASC, points ASC
      """)
  List<BillingRechargePackage> findActivePackages();

  @Select(
      """
      SELECT id, code, points, price_cents, currency, status, sort_order, created_at
      FROM billing_recharge_package
      WHERE code = #{code} AND status = 'active'
      """)
  BillingRechargePackage findActiveByCode(@Param("code") String code);

  @Select(
      """
      SELECT id, code, points, price_cents, currency, status, sort_order, created_at
      FROM billing_recharge_package
      ORDER BY sort_order ASC, points ASC
      """)
  List<BillingRechargePackage> findAllPackages();
}

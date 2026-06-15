package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingRechargePackage;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

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

  @Select(
      """
      <script>
      SELECT id, code, points, price_cents, currency, status, sort_order, created_at
      FROM billing_recharge_package
      <where>
        <if test="status != null and status != ''">AND status = #{status}</if>
        <if test="code != null and code != ''">AND LOWER(code) LIKE LOWER(CONCAT('%', #{code}, '%'))</if>
      </where>
      ORDER BY sort_order ASC, points ASC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  List<BillingRechargePackage> findPackagesAdmin(
      @Param("status") String status,
      @Param("code") String code,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*) FROM billing_recharge_package
      <where>
        <if test="status != null and status != ''">AND status = #{status}</if>
        <if test="code != null and code != ''">AND LOWER(code) LIKE LOWER(CONCAT('%', #{code}, '%'))</if>
      </where>
      </script>
      """)
  long countPackagesAdmin(@Param("status") String status, @Param("code") String code);

  @Select(
      """
      SELECT id, code, points, price_cents, currency, status, sort_order, created_at
      FROM billing_recharge_package
      WHERE code = #{code}
      """)
  BillingRechargePackage findByCode(@Param("code") String code);

  @Insert(
      """
      INSERT INTO billing_recharge_package (
          id, code, points, price_cents, currency, status, sort_order, created_at
      ) VALUES (
          #{id}, #{code}, #{points}, #{priceCents}, #{currency}, #{status}, #{sortOrder}, #{createdAt}
      )
      """)
  void insert(BillingRechargePackage pkg);

  @Update(
      """
      UPDATE billing_recharge_package
      SET points = #{points},
          price_cents = #{priceCents},
          currency = #{currency},
          status = #{status},
          sort_order = #{sortOrder}
      WHERE id = #{id}
      """)
  int update(BillingRechargePackage pkg);
}

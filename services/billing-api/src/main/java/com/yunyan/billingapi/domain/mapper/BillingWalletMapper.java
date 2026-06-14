package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingWallet;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BillingWalletMapper {

  @Select(
      """
      SELECT id, tenant_id, user_id, balance, frozen_balance, version, created_at, updated_at
      FROM billing_wallet
      WHERE tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  BillingWallet selectByTenantAndUser(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);

  @Select(
      """
      SELECT id, tenant_id, user_id, balance, frozen_balance, version, created_at, updated_at
      FROM billing_wallet
      WHERE id = #{id}
      """)
  BillingWallet selectById(@Param("id") UUID id);

  @Insert(
      """
      INSERT INTO billing_wallet (id, tenant_id, user_id, balance, frozen_balance, version, created_at, updated_at)
      VALUES (#{id}, #{tenantId}, #{userId}, #{balance}, #{frozenBalance}, #{version}, #{createdAt}, #{updatedAt})
      """)
  void insert(BillingWallet wallet);

  @org.apache.ibatis.annotations.Update(
      """
      UPDATE billing_wallet
      SET balance = #{balance}, version = version + 1, updated_at = #{updatedAt}
      WHERE id = #{id} AND version = #{version}
      """)
  int updateBalance(
      @Param("id") UUID id,
      @Param("balance") long balance,
      @Param("version") int version,
      @Param("updatedAt") java.time.Instant updatedAt);

  @org.apache.ibatis.annotations.Update(
      """
      UPDATE billing_wallet
      SET balance = #{balance}, frozen_balance = #{frozenBalance},
          version = version + 1, updated_at = #{updatedAt}
      WHERE id = #{id} AND version = #{version}
      """)
  int updateBalances(
      @Param("id") UUID id,
      @Param("balance") long balance,
      @Param("frozenBalance") long frozenBalance,
      @Param("version") int version,
      @Param("updatedAt") java.time.Instant updatedAt);

  @Select(
      """
      <script>
      SELECT id, tenant_id, user_id, balance, frozen_balance, version, created_at, updated_at
      FROM billing_wallet
      <where>
        <if test="tenantId != null">AND tenant_id = #{tenantId}</if>
        <if test="userId != null">AND user_id = #{userId}</if>
      </where>
      ORDER BY updated_at DESC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  java.util.List<BillingWallet> findWallets(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*) FROM billing_wallet
      <where>
        <if test="tenantId != null">AND tenant_id = #{tenantId}</if>
        <if test="userId != null">AND user_id = #{userId}</if>
      </where>
      </script>
      """)
  long countWallets(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);
}

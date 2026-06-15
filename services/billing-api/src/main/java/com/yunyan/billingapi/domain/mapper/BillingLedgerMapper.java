package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingLedger;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BillingLedgerMapper {

  @Select("SELECT COUNT(*) > 0 FROM billing_ledger WHERE idempotency_key = #{idempotencyKey}")
  boolean existsByIdempotencyKey(@Param("idempotencyKey") String idempotencyKey);

  @Select(
      """
      SELECT id, wallet_id, tenant_id, entry_type, amount, balance_after,
             product_code, remark, idempotency_key, created_at
      FROM billing_ledger
      WHERE idempotency_key = #{idempotencyKey}
      """)
  BillingLedger findByIdempotencyKey(@Param("idempotencyKey") String idempotencyKey);

  @Insert(
      """
      INSERT INTO billing_ledger (
          id, wallet_id, tenant_id, entry_type, amount, balance_after,
          product_code, remark, idempotency_key, created_at
      ) VALUES (
          #{id}, #{walletId}, #{tenantId}, #{entryType}, #{amount}, #{balanceAfter},
          #{productCode}, #{remark}, #{idempotencyKey}, #{createdAt}
      )
      """)
  void insert(BillingLedger ledger);

  @Select(
      """
      SELECT COUNT(*) > 0 FROM billing_ledger
      WHERE tenant_id = #{tenantId} AND remark = 'signup_bonus' AND entry_type = 'adjust'
      """)
  boolean existsSignupBonusForTenant(@Param("tenantId") UUID tenantId);

  @Select(
      """
      SELECT COUNT(*) > 0 FROM billing_ledger
      WHERE entry_type = 'refund' AND remark LIKE CONCAT('refund:', #{orderNo}, '%')
      """)
  boolean existsRefundLedgerForOrder(@Param("orderNo") String orderNo);

  @Select(
      """
      SELECT id, wallet_id, tenant_id, entry_type, amount, balance_after,
             product_code, remark, idempotency_key, created_at
      FROM billing_ledger
      WHERE wallet_id = #{walletId}
      ORDER BY created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      """)
  java.util.List<BillingLedger> findByWalletId(
      @Param("walletId") UUID walletId, @Param("limit") int limit, @Param("offset") int offset);

  @Select("SELECT COUNT(*) FROM billing_ledger WHERE wallet_id = #{walletId}")
  long countByWalletId(@Param("walletId") UUID walletId);

  @Select(
      """
      <script>
      SELECT l.id, l.wallet_id, l.tenant_id, w.user_id, l.amount, l.balance_after,
             l.remark, l.idempotency_key, l.created_at
      FROM billing_ledger l
      INNER JOIN billing_wallet w ON w.id = l.wallet_id
      WHERE l.entry_type = 'adjust' AND l.product_code = 'platform-admin'
      <if test="tenantId != null">AND l.tenant_id = #{tenantId}</if>
      <if test="userId != null">AND w.user_id = #{userId}</if>
      ORDER BY l.created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  java.util.List<AdminAdjustRecordRow> findAdminAdjustRecords(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*)
      FROM billing_ledger l
      INNER JOIN billing_wallet w ON w.id = l.wallet_id
      WHERE l.entry_type = 'adjust' AND l.product_code = 'platform-admin'
      <if test="tenantId != null">AND l.tenant_id = #{tenantId}</if>
      <if test="userId != null">AND w.user_id = #{userId}</if>
      </script>
      """)
  long countAdminAdjustRecords(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);

  @Select(
      """
      <script>
      SELECT l.id, l.wallet_id, l.tenant_id, w.user_id, l.entry_type, l.amount, l.balance_after,
             l.product_code, l.remark, l.created_at
      FROM billing_ledger l
      INNER JOIN billing_wallet w ON w.id = l.wallet_id
      WHERE l.tenant_id = #{tenantId}
      <if test="userId != null">AND w.user_id = #{userId}</if>
      <if test="entryType != null">AND l.entry_type = #{entryType}</if>
      ORDER BY l.created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  java.util.List<AdminLedgerRecordRow> findAdminLedgerRecords(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("entryType") String entryType,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*)
      FROM billing_ledger l
      INNER JOIN billing_wallet w ON w.id = l.wallet_id
      WHERE l.tenant_id = #{tenantId}
      <if test="userId != null">AND w.user_id = #{userId}</if>
      <if test="entryType != null">AND l.entry_type = #{entryType}</if>
      </script>
      """)
  long countAdminLedgerRecords(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("entryType") String entryType);
}

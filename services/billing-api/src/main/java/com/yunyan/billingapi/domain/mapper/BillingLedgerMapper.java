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
}

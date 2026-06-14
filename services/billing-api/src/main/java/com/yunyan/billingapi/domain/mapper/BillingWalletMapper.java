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

  @Insert(
      """
      INSERT INTO billing_wallet (id, tenant_id, user_id, balance, frozen_balance, version, created_at, updated_at)
      VALUES (#{id}, #{tenantId}, #{userId}, #{balance}, #{frozenBalance}, #{version}, #{createdAt}, #{updatedAt})
      """)
  void insert(BillingWallet wallet);
}

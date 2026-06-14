package com.yunyan.saasapi.domain.mapper;

import com.yunyan.saasapi.domain.entity.BillingSignupBonusPending;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingSignupBonusPendingMapper {

  @Insert(
      """
      INSERT INTO billing_signup_bonus_pending (
          id, tenant_id, user_id, tenant_kind, attempts, last_error, created_at, updated_at
      ) VALUES (
          #{id}, #{tenantId}, #{userId}, #{tenantKind}, 0, #{lastError}, #{createdAt}, #{updatedAt}
      )
      """)
  void insert(BillingSignupBonusPending row);

  @Select(
      """
      SELECT id, tenant_id, user_id, tenant_kind, attempts, last_error, created_at, updated_at
      FROM billing_signup_bonus_pending
      WHERE tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  BillingSignupBonusPending findByTenantAndUser(
      @Param("tenantId") UUID tenantId, @Param("userId") UUID userId);

  @Update(
      """
      UPDATE billing_signup_bonus_pending
      SET tenant_kind = #{tenantKind}, last_error = #{lastError}, updated_at = #{updatedAt}
      WHERE tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  int updateByTenantAndUser(BillingSignupBonusPending row);

  @Select(
      """
      SELECT id, tenant_id, user_id, tenant_kind, attempts, last_error, created_at, updated_at
      FROM billing_signup_bonus_pending
      WHERE attempts < #{maxAttempts}
      ORDER BY updated_at ASC
      LIMIT #{limit}
      """)
  List<BillingSignupBonusPending> findRetryable(
      @Param("maxAttempts") int maxAttempts, @Param("limit") int limit);

  @Update(
      """
      UPDATE billing_signup_bonus_pending
      SET attempts = attempts + 1, last_error = #{lastError}, updated_at = #{updatedAt}
      WHERE id = #{id}
      """)
  int recordFailure(
      @Param("id") UUID id,
      @Param("lastError") String lastError,
      @Param("updatedAt") Instant updatedAt);

  @Delete(
      """
      DELETE FROM billing_signup_bonus_pending
      WHERE tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  int deleteByTenantAndUser(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);
}

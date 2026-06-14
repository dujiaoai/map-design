package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingConsumptionRecord;
import com.yunyan.billingapi.domain.projection.TeamUsageRow;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingConsumptionRecordMapper {

  @Select(
      """
      SELECT id, tenant_id, user_id, wallet_id, product_code, rule_code, quantity, points,
             status, biz_ref, idempotency_key, hold_expires_at, created_at, updated_at
      FROM billing_consumption_record
      WHERE idempotency_key = #{idempotencyKey}
      """)
  BillingConsumptionRecord findByIdempotencyKey(@Param("idempotencyKey") String idempotencyKey);

  @Select(
      """
      SELECT id, tenant_id, user_id, wallet_id, product_code, rule_code, quantity, points,
             status, biz_ref, idempotency_key, hold_expires_at, created_at, updated_at
      FROM billing_consumption_record
      WHERE id = #{id}
      """)
  BillingConsumptionRecord findById(@Param("id") UUID id);

  @Insert(
      """
      INSERT INTO billing_consumption_record (
          id, tenant_id, user_id, wallet_id, product_code, rule_code, quantity, points,
          status, biz_ref, idempotency_key, hold_expires_at, created_at, updated_at
      ) VALUES (
          #{id}, #{tenantId}, #{userId}, #{walletId}, #{productCode}, #{ruleCode}, #{quantity}, #{points},
          #{status}, #{bizRef}, #{idempotencyKey}, #{holdExpiresAt}, #{createdAt}, #{updatedAt}
      )
      """)
  void insert(BillingConsumptionRecord record);

  @Update(
      """
      UPDATE billing_consumption_record
      SET status = #{status}, updated_at = #{updatedAt}
      WHERE id = #{id} AND status = #{expectedStatus}
      """)
  int updateStatus(
      @Param("id") UUID id,
      @Param("expectedStatus") String expectedStatus,
      @Param("status") String status,
      @Param("updatedAt") Instant updatedAt);

  @Select(
      """
      SELECT id, tenant_id, user_id, wallet_id, product_code, rule_code, quantity, points,
             status, biz_ref, idempotency_key, hold_expires_at, created_at, updated_at
      FROM billing_consumption_record
      WHERE status = 'held' AND hold_expires_at IS NOT NULL AND hold_expires_at < #{now}
      ORDER BY hold_expires_at ASC
      LIMIT #{limit}
      """)
  List<BillingConsumptionRecord> findExpiredHolds(
      @Param("now") Instant now, @Param("limit") int limit);

  @Select(
      """
      <script>
      SELECT user_id AS userId,
             COALESCE(SUM(points), 0) AS totalPoints,
             COUNT(*) AS eventCount
      FROM billing_consumption_record
      WHERE tenant_id = #{tenantId}
        AND status = 'confirmed'
        AND created_at &gt;= #{from}
        AND created_at &lt; #{to}
      <if test="productCode != null and productCode != ''">
        AND product_code = #{productCode}
      </if>
      GROUP BY user_id
      ORDER BY totalPoints DESC
      </script>
      """)
  List<TeamUsageRow> aggregateTeamUsage(
      @Param("tenantId") UUID tenantId,
      @Param("from") Instant from,
      @Param("to") Instant to,
      @Param("productCode") String productCode);
}

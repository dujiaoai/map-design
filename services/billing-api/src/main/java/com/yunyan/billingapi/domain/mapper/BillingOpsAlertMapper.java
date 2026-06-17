package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingOpsAlert;
import java.time.Instant;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.UUID;

@Mapper
public interface BillingOpsAlertMapper {

  @Insert(
      """
      INSERT INTO billing_ops_alert (
          id, alert_type, severity, reference_key, title, body, payload_json, resolved_at, created_at
      ) VALUES (
          #{id}, #{alertType}, #{severity}, #{referenceKey}, #{title}, #{body}, #{payloadJson},
          #{resolvedAt}, #{createdAt}
      )
      """)
  int insert(BillingOpsAlert alert);

  @Select(
      """
      SELECT COUNT(*) FROM billing_ops_alert
      WHERE alert_type = #{alertType} AND resolved_at IS NULL
      """)
  long countOpenByType(@Param("alertType") String alertType);

  @Select(
      """
      SELECT created_at FROM billing_ops_alert
      WHERE alert_type = #{alertType}
      ORDER BY created_at DESC
      LIMIT 1
      """)
  Instant findLatestCreatedAt(@Param("alertType") String alertType);

  @Select(
      """
      SELECT id, alert_type, severity, reference_key, title, body, payload_json, resolved_at, created_at
      FROM billing_ops_alert
      WHERE alert_type = #{alertType} AND resolved_at IS NULL
      ORDER BY created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      """)
  List<BillingOpsAlert> findOpenByType(
      @Param("alertType") String alertType,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      SELECT id, alert_type, severity, reference_key, title, body, payload_json, resolved_at, created_at
      FROM billing_ops_alert
      WHERE id = #{id}
      """)
  BillingOpsAlert findById(@Param("id") UUID id);

  @Update(
      """
      UPDATE billing_ops_alert
      SET resolved_at = #{resolvedAt}
      WHERE id = #{id} AND resolved_at IS NULL
      """)
  int resolve(@Param("id") UUID id, @Param("resolvedAt") Instant resolvedAt);
}

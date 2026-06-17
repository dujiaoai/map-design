package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingOpsAlert;
import java.time.Instant;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

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
}

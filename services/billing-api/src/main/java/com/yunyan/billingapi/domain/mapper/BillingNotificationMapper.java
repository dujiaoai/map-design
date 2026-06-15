package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingNotification;
import java.time.Instant;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingNotificationMapper {

  @Insert(
      """
      INSERT INTO billing_notification (
          id, tenant_id, user_id, category, title, body, dedupe_key, read_at, created_at
      ) VALUES (
          #{id}, #{tenantId}, #{userId}, #{category}, #{title}, #{body}, #{dedupeKey}, #{readAt}, #{createdAt}
      )
      """)
  int insert(BillingNotification notification);

  @Select(
      """
      SELECT COUNT(*) FROM billing_notification
      WHERE tenant_id = #{tenantId} AND user_id = #{userId}
        AND category = #{category} AND read_at IS NULL
        AND created_at >= #{since}
      """)
  long countUnreadSince(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("category") String category,
      @Param("since") Instant since);

  @Select(
      """
      SELECT id, tenant_id, user_id, category, title, body, dedupe_key, read_at, created_at
      FROM billing_notification
      WHERE tenant_id = #{tenantId} AND user_id = #{userId}
      ORDER BY created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      """)
  java.util.List<BillingNotification> findForUser(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      SELECT COUNT(*) FROM billing_notification
      WHERE tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  long countForUser(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);

  @Select(
      """
      SELECT id, tenant_id, user_id, category, title, body, dedupe_key, read_at, created_at
      FROM billing_notification
      WHERE id = #{id} AND tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  BillingNotification findForUserById(
      @Param("id") UUID id,
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId);

  @Update(
      """
      UPDATE billing_notification
      SET read_at = #{readAt}
      WHERE tenant_id = #{tenantId} AND user_id = #{userId} AND read_at IS NULL
      """)
  int markAllRead(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("readAt") Instant readAt);

  @Update(
      """
      UPDATE billing_notification
      SET read_at = #{readAt}
      WHERE id = #{id} AND tenant_id = #{tenantId} AND user_id = #{userId} AND read_at IS NULL
      """)
  int markRead(
      @Param("id") UUID id,
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("readAt") Instant readAt);
}

package com.yunyan.saasapi.domain.mapper;

import com.yunyan.saasapi.domain.entity.BillingMembershipSyncEvent;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingMembershipSyncEventMapper {

  @Insert(
      """
      INSERT INTO billing_membership_sync_event (id, event_type, payload, created_at)
      VALUES (#{id}, #{eventType}, #{payload}, #{createdAt})
      """)
  void insert(BillingMembershipSyncEvent row);

  @Select(
      """
      SELECT id, event_type, payload, created_at, processed_at, processed_by
      FROM billing_membership_sync_event
      WHERE processed_at IS NULL
      ORDER BY created_at ASC
      LIMIT #{limit}
      """)
  List<BillingMembershipSyncEvent> findPending(@Param("limit") int limit);

  @Update(
      """
      UPDATE billing_membership_sync_event
      SET processed_at = #{processedAt}, processed_by = #{processedBy}
      WHERE id = #{id} AND processed_at IS NULL
      """)
  int markProcessed(
      @Param("id") UUID id,
      @Param("processedAt") Instant processedAt,
      @Param("processedBy") String processedBy);
}

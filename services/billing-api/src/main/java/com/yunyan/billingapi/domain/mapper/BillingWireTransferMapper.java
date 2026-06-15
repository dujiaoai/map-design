package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingWireTransferRequest;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingWireTransferMapper {

  @Insert(
      """
      INSERT INTO billing_wire_transfer_request (
          id, request_no, tenant_id, user_id, company_name, contact_email, amount_cents, points,
          bank_reference, status, admin_remark, credited_ledger_id, created_at, updated_at
      ) VALUES (
          #{id}, #{requestNo}, #{tenantId}, #{userId}, #{companyName}, #{contactEmail}, #{amountCents},
          #{points}, #{bankReference}, #{status}, #{adminRemark}, #{creditedLedgerId}, #{createdAt}, #{updatedAt}
      )
      """)
  int insert(BillingWireTransferRequest request);

  @Select(
      """
      SELECT id, request_no, tenant_id, user_id, company_name, contact_email, amount_cents, points,
             bank_reference, status, admin_remark, credited_ledger_id, created_at, updated_at
      FROM billing_wire_transfer_request
      WHERE id = #{id}
      """)
  BillingWireTransferRequest findById(@Param("id") UUID id);

  @Select(
      """
      <script>
      SELECT id, request_no, tenant_id, user_id, company_name, contact_email, amount_cents, points,
             bank_reference, status, admin_remark, credited_ledger_id, created_at, updated_at
      FROM billing_wire_transfer_request
      <where>
        <if test="tenantId != null">AND tenant_id = #{tenantId}</if>
        <if test="userId != null">AND user_id = #{userId}</if>
        <if test="status != null and status != ''">AND status = #{status}</if>
      </where>
      ORDER BY created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  java.util.List<BillingWireTransferRequest> findRequests(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("status") String status,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*) FROM billing_wire_transfer_request
      <where>
        <if test="tenantId != null">AND tenant_id = #{tenantId}</if>
        <if test="userId != null">AND user_id = #{userId}</if>
        <if test="status != null and status != ''">AND status = #{status}</if>
      </where>
      </script>
      """)
  long countRequests(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("status") String status);

  @Update(
      """
      UPDATE billing_wire_transfer_request
      SET status = #{status},
          admin_remark = #{adminRemark},
          credited_ledger_id = #{creditedLedgerId},
          updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'pending'
      """)
  int updateStatus(
      @Param("id") UUID id,
      @Param("status") String status,
      @Param("adminRemark") String adminRemark,
      @Param("creditedLedgerId") UUID creditedLedgerId,
      @Param("updatedAt") java.time.Instant updatedAt);
}

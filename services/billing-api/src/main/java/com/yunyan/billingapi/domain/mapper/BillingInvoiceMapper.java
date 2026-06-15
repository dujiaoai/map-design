package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingInvoiceRequest;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingInvoiceMapper {

  @Insert(
      """
      INSERT INTO billing_invoice_request (
          id, tenant_id, user_id, order_no, invoice_type, title, tax_no, email, status,
          amount_cents, currency, admin_remark, dedupe_key, created_at, updated_at
      ) VALUES (
          #{id}, #{tenantId}, #{userId}, #{orderNo}, #{invoiceType}, #{title}, #{taxNo}, #{email}, #{status},
          #{amountCents}, #{currency}, #{adminRemark}, #{dedupeKey}, #{createdAt}, #{updatedAt}
      )
      """)
  int insert(BillingInvoiceRequest request);

  @Select(
      """
      SELECT id, tenant_id, user_id, order_no, invoice_type, title, tax_no, email, status,
             amount_cents, currency, admin_remark, pdf_url, dedupe_key, created_at, updated_at
      FROM billing_invoice_request
      WHERE dedupe_key = #{dedupeKey}
      """)
  BillingInvoiceRequest findByDedupeKey(@Param("dedupeKey") String dedupeKey);

  @Select(
      """
      SELECT id, tenant_id, user_id, order_no, invoice_type, title, tax_no, email, status,
             amount_cents, currency, admin_remark, pdf_url, dedupe_key, created_at, updated_at
      FROM billing_invoice_request
      WHERE id = #{id}
      """)
  BillingInvoiceRequest findById(@Param("id") UUID id);

  @Select(
      """
      <script>
      SELECT id, tenant_id, user_id, order_no, invoice_type, title, tax_no, email, status,
             amount_cents, currency, admin_remark, pdf_url, dedupe_key, created_at, updated_at
      FROM billing_invoice_request
      <where>
        <if test="tenantId != null">AND tenant_id = #{tenantId}</if>
        <if test="userId != null">AND user_id = #{userId}</if>
        <if test="status != null and status != ''">AND status = #{status}</if>
      </where>
      ORDER BY created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  java.util.List<BillingInvoiceRequest> findRequests(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("status") String status,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*) FROM billing_invoice_request
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
      UPDATE billing_invoice_request
      SET status = #{status}, admin_remark = #{adminRemark}, updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'pending'
      """)
  int updateStatus(
      @Param("id") UUID id,
      @Param("status") String status,
      @Param("adminRemark") String adminRemark,
      @Param("updatedAt") java.time.Instant updatedAt);

  @Update(
      """
      UPDATE billing_invoice_request
      SET status = 'issued', pdf_url = #{pdfUrl}, updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'pending'
      """)
  int issueWithPdf(
      @Param("id") UUID id,
      @Param("pdfUrl") String pdfUrl,
      @Param("updatedAt") java.time.Instant updatedAt);
}

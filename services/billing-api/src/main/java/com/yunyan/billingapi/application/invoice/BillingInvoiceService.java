package com.yunyan.billingapi.application.invoice;

import com.yunyan.billingapi.domain.entity.BillingInvoiceRequest;
import com.yunyan.billingapi.domain.mapper.BillingInvoiceMapper;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminIssueInvoiceRequest;
import com.yunyan.billingapi.web.dto.AdminRejectInvoiceRequest;
import com.yunyan.billingapi.web.dto.CreateInvoiceRequest;
import com.yunyan.billingapi.web.dto.InvoiceListResponse;
import com.yunyan.billingapi.web.dto.InvoiceRequestDto;
import java.time.Instant;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class BillingInvoiceService {

  public static final String STATUS_PENDING = "pending";
  public static final String STATUS_ISSUED = "issued";
  public static final String STATUS_REJECTED = "rejected";

  private final BillingInvoiceMapper invoiceMapper;
  private final BillingRechargeOrderMapper orderMapper;

  public BillingInvoiceService(
      BillingInvoiceMapper invoiceMapper, BillingRechargeOrderMapper orderMapper) {
    this.invoiceMapper = invoiceMapper;
    this.orderMapper = orderMapper;
  }

  @Transactional
  public InvoiceRequestDto createRequest(SaasPrincipal principal, CreateInvoiceRequest request) {
    if ("enterprise".equals(request.invoiceType()) && !StringUtils.hasText(request.taxNo())) {
      throw AuthException.badRequest("taxNo is required for enterprise invoice");
    }

    var orderNo = request.orderNo().trim();
    var order =
        orderMapper.findByOrderNoForUser(orderNo, principal.tenantId(), principal.userId());
    if (order == null) {
      throw AuthException.notFound("Recharge order not found");
    }
    if (!"paid".equals(order.getStatus())) {
      throw AuthException.badRequest("Only paid recharge orders can request an invoice");
    }

    var dedupeKey = "invoice:" + orderNo;
    var existing = invoiceMapper.findByDedupeKey(dedupeKey);
    if (existing != null) {
      return toDto(existing);
    }

    var now = Instant.now();
    var invoice = new BillingInvoiceRequest();
    invoice.setId(UUID.randomUUID());
    invoice.setTenantId(principal.tenantId());
    invoice.setUserId(principal.userId());
    invoice.setOrderNo(orderNo);
    invoice.setInvoiceType(request.invoiceType());
    invoice.setTitle(request.title().trim());
    invoice.setTaxNo(StringUtils.hasText(request.taxNo()) ? request.taxNo().trim() : null);
    invoice.setEmail(request.email().trim());
    invoice.setStatus(STATUS_PENDING);
    invoice.setAmountCents(order.getPriceCents());
    invoice.setCurrency(order.getCurrency());
    invoice.setAdminRemark(null);
    invoice.setDedupeKey(dedupeKey);
    invoice.setCreatedAt(now);
    invoice.setUpdatedAt(now);

    try {
      invoiceMapper.insert(invoice);
    } catch (DuplicateKeyException ex) {
      var replay = invoiceMapper.findByDedupeKey(dedupeKey);
      if (replay == null) {
        throw ex;
      }
      return toDto(replay);
    }

    return toDto(invoice);
  }

  public InvoiceListResponse listForUser(SaasPrincipal principal, int page, int size) {
    return listRequests(principal.tenantId(), principal.userId(), null, page, size);
  }

  public InvoiceListResponse listForAdmin(
      UUID tenantId, UUID userId, String status, int page, int size) {
    return listRequests(tenantId, userId, status, page, size);
  }

  @Transactional
  public InvoiceRequestDto issue(
      SaasPrincipal principal, UUID invoiceId, AdminIssueInvoiceRequest request) {
    var pdfUrl = resolvePdfUrl(invoiceId, request != null ? request.pdfUrl() : null);
    return issuePending(invoiceId, pdfUrl);
  }

  @Transactional
  public InvoiceRequestDto reject(
      SaasPrincipal principal, UUID invoiceId, AdminRejectInvoiceRequest request) {
    return updatePendingStatus(invoiceId, STATUS_REJECTED, request.reason().trim());
  }

  static String resolvePdfUrl(UUID invoiceId, String requested) {
    if (StringUtils.hasText(requested)) {
      return requested.trim();
    }
    return "invoices/" + invoiceId + ".pdf";
  }

  private InvoiceListResponse listRequests(
      UUID tenantId, UUID userId, String status, int page, int size) {
    var limit = Math.clamp(size, 1, 100);
    var offset = Math.max(page, 0) * limit;
    var normalizedStatus = StringUtils.hasText(status) ? status.trim() : null;
    var items =
        invoiceMapper.findRequests(tenantId, userId, normalizedStatus, limit, offset).stream()
            .map(BillingInvoiceService::toDto)
            .toList();
    var total = invoiceMapper.countRequests(tenantId, userId, normalizedStatus);
    return new InvoiceListResponse(items, page, limit, total);
  }

  private InvoiceRequestDto issuePending(UUID invoiceId, String pdfUrl) {
    var existing = invoiceMapper.findById(invoiceId);
    if (existing == null) {
      throw AuthException.notFound("Invoice request not found");
    }
    if (!STATUS_PENDING.equals(existing.getStatus())) {
      throw AuthException.badRequest("Invoice request is not pending");
    }

    var updated = invoiceMapper.issueWithPdf(invoiceId, pdfUrl, Instant.now());
    if (updated != 1) {
      throw AuthException.conflict("Invoice request status changed concurrently");
    }

    var refreshed = invoiceMapper.findById(invoiceId);
    return toDto(refreshed);
  }

  private InvoiceRequestDto updatePendingStatus(UUID invoiceId, String status, String adminRemark) {
    var existing = invoiceMapper.findById(invoiceId);
    if (existing == null) {
      throw AuthException.notFound("Invoice request not found");
    }
    if (!STATUS_PENDING.equals(existing.getStatus())) {
      throw AuthException.badRequest("Invoice request is not pending");
    }

    var updated =
        invoiceMapper.updateStatus(invoiceId, status, adminRemark, Instant.now());
    if (updated != 1) {
      throw AuthException.conflict("Invoice request status changed concurrently");
    }

    var refreshed = invoiceMapper.findById(invoiceId);
    return toDto(refreshed);
  }

  static InvoiceRequestDto toDto(BillingInvoiceRequest request) {
    return new InvoiceRequestDto(
        request.getId().toString(),
        request.getTenantId().toString(),
        request.getUserId().toString(),
        request.getOrderNo(),
        request.getInvoiceType(),
        request.getTitle(),
        request.getTaxNo(),
        request.getEmail(),
        request.getStatus(),
        request.getAmountCents(),
        request.getCurrency(),
        request.getAdminRemark(),
        request.getPdfUrl(),
        request.getCreatedAt() != null ? request.getCreatedAt().toString() : null,
        request.getUpdatedAt() != null ? request.getUpdatedAt().toString() : null);
  }
}

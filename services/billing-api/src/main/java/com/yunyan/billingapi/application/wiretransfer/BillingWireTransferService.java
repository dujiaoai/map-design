package com.yunyan.billingapi.application.wiretransfer;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.entity.BillingWireTransferRequest;
import com.yunyan.billingapi.domain.mapper.BillingWireTransferMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.CreateWireTransferRequest;
import com.yunyan.billingapi.web.dto.WireTransferListResponse;
import com.yunyan.billingapi.web.dto.WireTransferPlatformAccountResponse;
import com.yunyan.billingapi.web.dto.WireTransferRequestDto;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class BillingWireTransferService {

  public static final String STATUS_PENDING = "pending";
  public static final String STATUS_CREDITED = "credited";
  public static final String STATUS_REJECTED = "rejected";

  private final BillingWireTransferMapper wireTransferMapper;
  private final BillingAppProperties billingAppProperties;

  public BillingWireTransferService(
      BillingWireTransferMapper wireTransferMapper, BillingAppProperties billingAppProperties) {
    this.wireTransferMapper = wireTransferMapper;
    this.billingAppProperties = billingAppProperties;
  }

  public WireTransferPlatformAccountResponse getPlatformAccount() {
    var account = billingAppProperties.getWireTransfer().getPlatformAccount();
    var configured =
        account.isEnabled()
            && StringUtils.hasText(account.getAccountName())
            && StringUtils.hasText(account.getBankName())
            && StringUtils.hasText(account.getAccountNo());
    if (!configured) {
      return new WireTransferPlatformAccountResponse(false, "", "", "", "");
    }
    return new WireTransferPlatformAccountResponse(
        true,
        account.getAccountName().trim(),
        account.getBankName().trim(),
        account.getAccountNo().trim(),
        StringUtils.hasText(account.getTransferRemark()) ? account.getTransferRemark().trim() : "");
  }

  @Transactional
  public WireTransferRequestDto createRequest(
      SaasPrincipal principal, CreateWireTransferRequest request) {
    var now = Instant.now();
    var wireTransfer = new BillingWireTransferRequest();
    wireTransfer.setId(UUID.randomUUID());
    wireTransfer.setRequestNo(generateRequestNo());
    wireTransfer.setTenantId(principal.tenantId());
    wireTransfer.setUserId(principal.userId());
    wireTransfer.setCompanyName(request.companyName().trim());
    wireTransfer.setContactEmail(request.contactEmail().trim());
    wireTransfer.setAmountCents(request.amountCents());
    wireTransfer.setPoints(request.points());
    wireTransfer.setBankReference(
        StringUtils.hasText(request.bankReference()) ? request.bankReference().trim() : null);
    wireTransfer.setStatus(STATUS_PENDING);
    wireTransfer.setAdminRemark(null);
    wireTransfer.setCreditedLedgerId(null);
    wireTransfer.setCreatedAt(now);
    wireTransfer.setUpdatedAt(now);
    wireTransferMapper.insert(wireTransfer);
    return toDto(wireTransfer);
  }

  public WireTransferListResponse listForUser(SaasPrincipal principal, int page, int size) {
    return listRequests(principal.tenantId(), principal.userId(), null, page, size);
  }

  public WireTransferListResponse listForAdmin(
      UUID tenantId, UUID userId, String status, int page, int size) {
    return listRequests(tenantId, userId, status, page, size);
  }

  private WireTransferListResponse listRequests(
      UUID tenantId, UUID userId, String status, int page, int size) {
    var limit = Math.clamp(size, 1, 100);
    var offset = Math.max(page, 0) * limit;
    var normalizedStatus = StringUtils.hasText(status) ? status.trim() : null;
    var items =
        wireTransferMapper.findRequests(tenantId, userId, normalizedStatus, limit, offset).stream()
            .map(BillingWireTransferService::toDto)
            .toList();
    var total = wireTransferMapper.countRequests(tenantId, userId, normalizedStatus);
    return new WireTransferListResponse(items, page, limit, total);
  }

  public static WireTransferRequestDto toDto(BillingWireTransferRequest request) {
    return new WireTransferRequestDto(
        request.getId().toString(),
        request.getRequestNo(),
        request.getTenantId().toString(),
        request.getUserId().toString(),
        request.getCompanyName(),
        request.getContactEmail(),
        request.getAmountCents(),
        request.getPoints(),
        request.getBankReference(),
        request.getStatus(),
        request.getAdminRemark(),
        request.getCreatedAt() != null ? request.getCreatedAt().toString() : null,
        request.getUpdatedAt() != null ? request.getUpdatedAt().toString() : null);
  }

  private static String generateRequestNo() {
    return "WT-"
        + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
  }
}

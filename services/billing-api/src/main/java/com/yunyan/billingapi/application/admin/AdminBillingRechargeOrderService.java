package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.entity.BillingRechargeOrder;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.web.dto.AdminRechargeOrderDto;
import com.yunyan.billingapi.web.dto.AdminRechargeOrderListResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingRechargeOrderService {

  private static final int MAX_PAGE_SIZE = 100;

  private final BillingRechargeOrderMapper orderMapper;

  public AdminBillingRechargeOrderService(BillingRechargeOrderMapper orderMapper) {
    this.orderMapper = orderMapper;
  }

  public AdminRechargeOrderListResponse listOrders(
      UUID tenantId, UUID userId, String status, int page, int size) {
    var safePage = Math.max(page, 0);
    var safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    var offset = safePage * safeSize;
    var normalizedStatus = StringUtils.hasText(status) ? status.trim() : null;

    var orders =
        orderMapper.findOrders(tenantId, userId, normalizedStatus, safeSize, offset);
    var total = orderMapper.countOrders(tenantId, userId, normalizedStatus);
    var items = orders.stream().map(this::toDto).toList();
    return new AdminRechargeOrderListResponse(items, safePage, safeSize, total);
  }

  private AdminRechargeOrderDto toDto(BillingRechargeOrder order) {
    return new AdminRechargeOrderDto(
        order.getOrderNo(),
        order.getTenantId(),
        order.getUserId(),
        order.getStatus(),
        order.getChannel(),
        order.getPoints() != null ? order.getPoints() : 0L,
        order.getPriceCents() != null ? order.getPriceCents() : 0L,
        order.getCurrency(),
        order.getProviderTradeNo(),
        order.getPaidAt(),
        order.getCreatedAt());
  }
}

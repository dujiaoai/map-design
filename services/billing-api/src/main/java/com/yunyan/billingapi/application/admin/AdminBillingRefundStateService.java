package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBillingRefundStateService {

  private final BillingRechargeOrderMapper orderMapper;

  public AdminBillingRefundStateService(BillingRechargeOrderMapper orderMapper) {
    this.orderMapper = orderMapper;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void revertRefunding(UUID orderId) {
    orderMapper.revertRefunding(orderId, Instant.now());
  }
}

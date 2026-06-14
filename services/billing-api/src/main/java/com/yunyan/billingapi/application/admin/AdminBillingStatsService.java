package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.web.dto.AdminBillingStatsResponse;
import org.springframework.stereotype.Service;

@Service
public class AdminBillingStatsService {

  private final BillingWalletMapper walletMapper;
  private final BillingRechargeOrderMapper orderMapper;

  public AdminBillingStatsService(
      BillingWalletMapper walletMapper, BillingRechargeOrderMapper orderMapper) {
    this.walletMapper = walletMapper;
    this.orderMapper = orderMapper;
  }

  public AdminBillingStatsResponse getStats() {
    return new AdminBillingStatsResponse(
        walletMapper.countAll(),
        walletMapper.sumBalance(),
        orderMapper.countByStatus("paid"),
        orderMapper.sumPaidPriceCents(),
        orderMapper.countByStatus("pending"));
  }
}

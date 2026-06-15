package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.application.payment.provider.PaymentProviderRegistry;
import com.yunyan.billingapi.application.recharge.RechargeOrderService;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PendingPaymentQueryService {

  private static final Logger log = LoggerFactory.getLogger(PendingPaymentQueryService.class);

  private final BillingAppProperties billingAppProperties;
  private final PaymentProviderRegistry paymentProviderRegistry;
  private final BillingRechargeOrderMapper orderMapper;
  private final RechargeOrderService rechargeOrderService;

  public PendingPaymentQueryService(
      BillingAppProperties billingAppProperties,
      PaymentProviderRegistry paymentProviderRegistry,
      BillingRechargeOrderMapper orderMapper,
      RechargeOrderService rechargeOrderService) {
    this.billingAppProperties = billingAppProperties;
    this.paymentProviderRegistry = paymentProviderRegistry;
    this.orderMapper = orderMapper;
    this.rechargeOrderService = rechargeOrderService;
  }

  public int pollPendingOnlinePayments(int batchSize) {
    if (!billingAppProperties.getPayment().isQueryScanEnabled()) {
      return 0;
    }
    if (!paymentProviderRegistry.isLiveMode()) {
      return 0;
    }

    var limit = Math.clamp(batchSize, 1, 100);
    var orders = orderMapper.findPendingOnlineOrders(Instant.now(), limit);
    var credited = 0;
    for (var order : orders) {
      try {
        var query =
            paymentProviderRegistry
                .require(order.getChannel())
                .queryPayment(order.getOrderNo(), order.getProviderTradeNo());
        if (!query.paid()) {
          continue;
        }
        var priceCents = order.getPriceCents() != null ? order.getPriceCents() : 0L;
        var providerTradeNo =
            StringUtils.hasText(query.providerTradeNo())
                ? query.providerTradeNo()
                : order.getProviderTradeNo();
        rechargeOrderService.completeWebhookPayment(
            order.getChannel(),
            new PaymentWebhookPayload(order.getOrderNo(), providerTradeNo, true, priceCents));
        credited++;
      } catch (RuntimeException ex) {
        log.warn(
            "Pending payment query failed for order {} channel {}: {}",
            order.getOrderNo(),
            order.getChannel(),
            ex.getMessage());
      }
    }
    return credited;
  }
}

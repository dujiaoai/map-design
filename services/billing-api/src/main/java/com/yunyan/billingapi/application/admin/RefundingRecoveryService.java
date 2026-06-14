package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefundingRecoveryService {

  private static final Logger log = LoggerFactory.getLogger(RefundingRecoveryService.class);

  private static final int BATCH_SIZE = 50;

  private final BillingAppProperties billingAppProperties;
  private final BillingRechargeOrderMapper orderMapper;
  private final BillingLedgerMapper ledgerMapper;

  public RefundingRecoveryService(
      BillingAppProperties billingAppProperties,
      BillingRechargeOrderMapper orderMapper,
      BillingLedgerMapper ledgerMapper) {
    this.billingAppProperties = billingAppProperties;
    this.orderMapper = orderMapper;
    this.ledgerMapper = ledgerMapper;
  }

  @Transactional
  public int recoverStuckRefundingOrders() {
    var stuckMinutes = billingAppProperties.getRefund().getStuckMinutes();
    var cutoff = Instant.now().minusSeconds(stuckMinutes * 60L);
    var stuck = orderMapper.findStuckRefundingOrders(cutoff, BATCH_SIZE);
    var recovered = 0;

    for (var order : stuck) {
      var now = Instant.now();
      if (ledgerMapper.existsRefundLedgerForOrder(order.getOrderNo())) {
        if (orderMapper.markRefunded(order.getId(), now) == 1) {
          recovered++;
          log.info("Completed stuck refund for order {}", order.getOrderNo());
        }
      } else if (orderMapper.revertRefunding(order.getId(), now) == 1) {
        recovered++;
        log.info("Reverted stuck refunding order {} to paid", order.getOrderNo());
      }
    }

    return recovered;
  }
}

package com.yunyan.billingapi.application.recharge;

import com.yunyan.billingapi.application.payment.PaymentGatewayRegistry;
import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.entity.BillingRechargeOrder;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.domain.mapper.BillingRechargePackageMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.CreateRechargeOrderRequest;
import com.yunyan.billingapi.web.dto.RechargeOrderResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class RechargeOrderService {

  private final BillingAppProperties billingAppProperties;
  private final WalletService walletService;
  private final BillingRechargePackageMapper packageMapper;
  private final BillingRechargeOrderMapper orderMapper;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;
  private final PaymentGatewayRegistry paymentGatewayRegistry;

  public RechargeOrderService(
      BillingAppProperties billingAppProperties,
      WalletService walletService,
      BillingRechargePackageMapper packageMapper,
      BillingRechargeOrderMapper orderMapper,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper,
      PaymentGatewayRegistry paymentGatewayRegistry) {
    this.billingAppProperties = billingAppProperties;
    this.walletService = walletService;
    this.packageMapper = packageMapper;
    this.orderMapper = orderMapper;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
    this.paymentGatewayRegistry = paymentGatewayRegistry;
  }

  @Transactional
  public RechargeOrderResponse createOrder(SaasPrincipal principal, CreateRechargeOrderRequest request) {
    if (!StringUtils.hasText(request.packageCode())) {
      throw AuthException.badRequest("packageCode is required");
    }
    var channel = StringUtils.hasText(request.channel()) ? request.channel().trim() : "mock";

    var pkg = packageMapper.findActiveByCode(request.packageCode().trim());
    if (pkg == null) {
      throw AuthException.notFound("Recharge package not found");
    }

    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
    var now = Instant.now();
    var orderNo = "RO-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    var payment =
        paymentGatewayRegistry
            .require(channel)
            .createPayment(
                orderNo,
                pkg.getPriceCents() != null ? pkg.getPriceCents() : 0L,
                pkg.getCurrency(),
                pkg.getCode());

    var order = new BillingRechargeOrder();
    order.setId(UUID.randomUUID());
    order.setOrderNo(orderNo);
    order.setTenantId(principal.tenantId());
    order.setUserId(principal.userId());
    order.setWalletId(wallet.getId());
    order.setPackageId(pkg.getId());
    order.setChannel(channel);
    order.setStatus("pending");
    order.setPoints(pkg.getPoints());
    order.setPriceCents(pkg.getPriceCents());
    order.setCurrency(pkg.getCurrency());
    order.setProviderTradeNo(payment.providerTradeNo());
    order.setExpireAt(now.plusSeconds(billingAppProperties.getRecharge().getOrderTtlMinutes() * 60L));
    order.setCreatedAt(now);
    order.setUpdatedAt(now);
    orderMapper.insert(order);

    return toResponse(order, payment.payUrl(), wallet.getBalance());
  }

  public RechargeOrderResponse getOrder(SaasPrincipal principal, String orderNo) {
    var order = requireOrder(principal, orderNo);
    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
    return toResponse(order, null, wallet.getBalance());
  }

  @Transactional
  public RechargeOrderResponse cancelOrder(SaasPrincipal principal, String orderNo) {
    var order = requirePendingOrder(principal, orderNo);
    var updated = orderMapper.markCancelled(order.getId(), Instant.now());
    if (updated == 0) {
      throw AuthException.conflict("Order cannot be cancelled");
    }
    order.setStatus("cancelled");
    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
    return toResponse(order, null, wallet.getBalance());
  }

  @Transactional
  public RechargeOrderResponse completeMockPayment(SaasPrincipal principal, String orderNo) {
    if (!billingAppProperties.getPayment().isMockEnabled()) {
      throw AuthException.badRequest("Mock payment is disabled");
    }
    var order = requirePendingOrder(principal, orderNo);
    if (!"mock".equals(order.getChannel())) {
      throw AuthException.badRequest("Order channel does not support mock payment");
    }
    if (order.getExpireAt() != null && order.getExpireAt().isBefore(Instant.now())) {
      throw AuthException.conflict("Order expired");
    }

    var wallet = walletMapper.selectByTenantAndUser(principal.tenantId(), principal.userId());
    if (wallet == null) {
      throw AuthException.notFound("Wallet not found");
    }

    var now = Instant.now();
    var updated =
        orderMapper.markPaid(order.getId(), "paid", order.getProviderTradeNo(), now, now);
    if (updated == 0) {
      throw AuthException.conflict("Order already processed");
    }

    var points = order.getPoints() != null ? order.getPoints() : 0L;
    var currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var newBalance = currentBalance + points;
    var balanceUpdated =
        walletMapper.updateBalance(
            wallet.getId(), newBalance, wallet.getVersion(), now);
    if (balanceUpdated == 0) {
      throw AuthException.conflict("Wallet update conflict, retry");
    }

    var idempotencyKey = "recharge:" + order.getOrderNo();
    if (!ledgerMapper.existsByIdempotencyKey(idempotencyKey)) {
      var ledger = new BillingLedger();
      ledger.setId(UUID.randomUUID());
      ledger.setWalletId(wallet.getId());
      ledger.setTenantId(principal.tenantId());
      ledger.setEntryType("recharge");
      ledger.setAmount(points);
      ledger.setBalanceAfter(newBalance);
      ledger.setProductCode("map-workspace");
      ledger.setRemark("recharge:" + order.getOrderNo());
      ledger.setIdempotencyKey(idempotencyKey);
      ledger.setCreatedAt(now);
      ledgerMapper.insert(ledger);
    }

    order.setStatus("paid");
    order.setPaidAt(now);
    return toResponse(order, null, newBalance);
  }

  private BillingRechargeOrder requireOrder(SaasPrincipal principal, String orderNo) {
    var order = orderMapper.findByOrderNoForUser(orderNo, principal.tenantId(), principal.userId());
    if (order == null) {
      throw AuthException.notFound("Recharge order not found");
    }
    return order;
  }

  private BillingRechargeOrder requirePendingOrder(SaasPrincipal principal, String orderNo) {
    var order = requireOrder(principal, orderNo);
    if (!"pending".equals(order.getStatus())) {
      throw AuthException.conflict("Order is not pending");
    }
    return order;
  }

  private RechargeOrderResponse toResponse(
      BillingRechargeOrder order, String payUrl, Long walletBalance) {
    return new RechargeOrderResponse(
        order.getOrderNo(),
        order.getStatus(),
        order.getChannel(),
        order.getPoints() != null ? order.getPoints() : 0L,
        order.getPriceCents() != null ? order.getPriceCents() : 0L,
        order.getCurrency(),
        payUrl,
        order.getExpireAt(),
        order.getPaidAt(),
        walletBalance != null ? walletBalance : 0L);
  }
}

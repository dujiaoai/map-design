package com.yunyan.billingapi.application.recharge;

import com.yunyan.billingapi.application.coupon.BillingCouponService;
import com.yunyan.billingapi.application.metrics.BillingMetrics;
import com.yunyan.billingapi.application.payment.PaymentGatewayRegistry;
import com.yunyan.billingapi.application.tenant.TenantRechargePolicyService;
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
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
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
  private final TenantRechargePolicyService tenantRechargePolicyService;
  private final BillingMetrics billingMetrics;
  private final BillingCouponService billingCouponService;

  public RechargeOrderService(
      BillingAppProperties billingAppProperties,
      WalletService walletService,
      BillingRechargePackageMapper packageMapper,
      BillingRechargeOrderMapper orderMapper,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper,
      PaymentGatewayRegistry paymentGatewayRegistry,
      TenantRechargePolicyService tenantRechargePolicyService,
      BillingMetrics billingMetrics,
      BillingCouponService billingCouponService) {
    this.billingAppProperties = billingAppProperties;
    this.walletService = walletService;
    this.packageMapper = packageMapper;
    this.orderMapper = orderMapper;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
    this.paymentGatewayRegistry = paymentGatewayRegistry;
    this.tenantRechargePolicyService = tenantRechargePolicyService;
    this.billingMetrics = billingMetrics;
    this.billingCouponService = billingCouponService;
  }

  @Transactional
  public RechargeOrderResponse createOrder(SaasPrincipal principal, CreateRechargeOrderRequest request) {
    if (!tenantRechargePolicyService.isSelfRechargeAllowed(principal)) {
      throw AuthException.forbidden(
          "Member self-recharge is disabled for this tenant; contact your administrator");
    }
    if (!StringUtils.hasText(request.packageCode())) {
      throw AuthException.badRequest("packageCode is required");
    }
    var channel = resolvePaymentChannel(request.channel());

    var pkg = packageMapper.findActiveByCode(request.packageCode().trim());
    if (pkg == null) {
      throw AuthException.notFound("Recharge package not found");
    }

    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
    var now = Instant.now();
    var orderNo = "RO-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    var listPriceCents = pkg.getPriceCents() != null ? pkg.getPriceCents() : 0L;
    long couponDiscountCents = 0L;
    String appliedCouponCode = null;

    if (StringUtils.hasText(request.couponCode())) {
      var discountQuote =
          billingCouponService.resolveRechargeDiscount(
              principal, request.couponCode(), listPriceCents);
      couponDiscountCents = discountQuote.discountCents();
      appliedCouponCode = discountQuote.code();
    }

    var payableCents = Math.max(listPriceCents - couponDiscountCents, 0L);
    var payment =
        paymentGatewayRegistry
            .require(channel)
            .createPayment(
                orderNo,
                payableCents,
                pkg.getCurrency(),
                pkg.getCode(),
                request.payScene());

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
    order.setListPriceCents(listPriceCents);
    order.setPriceCents(payableCents);
    order.setCouponCode(appliedCouponCode);
    order.setCouponDiscountCents(couponDiscountCents);
    order.setCurrency(pkg.getCurrency());
    order.setProviderTradeNo(payment.providerTradeNo());
    order.setExpireAt(now.plusSeconds(billingAppProperties.getRecharge().getOrderTtlMinutes() * 60L));
    order.setCreatedAt(now);
    order.setUpdatedAt(now);
    orderMapper.insert(order);

    return toResponse(order, payment.payUrl(), payment.payScene(), wallet.getBalance());
  }

  public RechargeOrderResponse getOrder(SaasPrincipal principal, String orderNo) {
    var order = requireOrder(principal, orderNo);
    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
    return toResponse(order, null, null, wallet.getBalance());
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
    return toResponse(order, null, null, wallet.getBalance());
  }

  /** Marks pending orders past {@code expire_at} as expired. Returns count updated. */
  @Transactional
  public int expirePendingOrders(int batchSize) {
    var expired = orderMapper.findExpiredPendingOrders(Instant.now(), batchSize);
    var count = 0;
    for (var order : expired) {
      if (orderMapper.markExpired(order.getId(), Instant.now()) > 0) {
        count++;
      }
    }
    return count;
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
    return settlePendingOrder(order, order.getProviderTradeNo());
  }

  @Transactional
  public void completeWebhookPayment(String expectedChannel, PaymentWebhookPayload payload) {
    if (!payload.success()) {
      return;
    }
    var order = orderMapper.findByOrderNo(payload.orderNo().trim());
    if (order == null) {
      throw AuthException.notFound("Recharge order not found");
    }
    if (!expectedChannel.equals(order.getChannel())) {
      throw AuthException.badRequest("Order channel mismatch");
    }
    if ("paid".equals(order.getStatus())) {
      return;
    }
    if (!"pending".equals(order.getStatus())) {
      throw AuthException.conflict("Order is not pending");
    }
    if (order.getExpireAt() != null && order.getExpireAt().isBefore(Instant.now())) {
      throw AuthException.conflict("Order expired");
    }
    if (payload.priceCents() == null) {
      throw AuthException.badRequest("priceCents is required for successful payment webhook");
    }
    var orderPrice = order.getPriceCents() != null ? order.getPriceCents() : 0L;
    if (!payload.priceCents().equals(orderPrice)) {
      throw AuthException.badRequest("Payment amount mismatch");
    }
    var providerTradeNo =
        StringUtils.hasText(payload.providerTradeNo())
            ? payload.providerTradeNo().trim()
            : order.getProviderTradeNo();
    settlePendingOrder(order, providerTradeNo);
  }

  private RechargeOrderResponse settlePendingOrder(
      BillingRechargeOrder order, String providerTradeNo) {
    var wallet = walletMapper.selectByTenantAndUser(order.getTenantId(), order.getUserId());
    if (wallet == null) {
      throw AuthException.notFound("Wallet not found");
    }

    var now = Instant.now();
    var tradeNo = StringUtils.hasText(providerTradeNo) ? providerTradeNo : order.getProviderTradeNo();
    var updated = orderMapper.markPaid(order.getId(), "paid", tradeNo, now, now);
    if (updated == 0) {
      if ("paid".equals(order.getStatus())) {
        return toResponse(order, null, null, wallet.getBalance());
      }
      throw AuthException.conflict("Order already processed");
    }

    billingCouponService.recordRechargeDiscountRedemption(order);

    var points = order.getPoints() != null ? order.getPoints() : 0L;
    var currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var newBalance = currentBalance + points;
    var balanceUpdated =
        walletMapper.updateBalance(wallet.getId(), newBalance, wallet.getVersion(), now);
    if (balanceUpdated == 0) {
      throw AuthException.conflict("Wallet update conflict, retry");
    }

    var idempotencyKey = "recharge:" + order.getOrderNo();
    if (!ledgerMapper.existsByIdempotencyKey(idempotencyKey)) {
      var ledger = new BillingLedger();
      ledger.setId(UUID.randomUUID());
      ledger.setWalletId(wallet.getId());
      ledger.setTenantId(order.getTenantId());
      ledger.setEntryType("recharge");
      ledger.setAmount(points);
      ledger.setBalanceAfter(newBalance);
      ledger.setProductCode("map-workspace");
      ledger.setRemark("recharge:" + order.getOrderNo());
      ledger.setIdempotencyKey(idempotencyKey);
      ledger.setCreatedAt(now);
      ledgerMapper.insert(ledger);
    }

    billingMetrics.recordRechargeCompleted();

    order.setStatus("paid");
    order.setPaidAt(now);
    order.setProviderTradeNo(tradeNo);
    return toResponse(order, null, null, newBalance);
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

  private String resolvePaymentChannel(String requestedChannel) {
    if (StringUtils.hasText(requestedChannel)) {
      var channel = requestedChannel.trim();
      assertMockChannelAllowed(channel);
      return channel;
    }
    if (billingAppProperties.getPayment().isMockEnabled()) {
      return "mock";
    }
    throw AuthException.badRequest("channel is required when mock payment is disabled");
  }

  private void assertMockChannelAllowed(String channel) {
    if ("mock".equals(channel) && !billingAppProperties.getPayment().isMockEnabled()) {
      throw AuthException.badRequest("Mock payment channel is disabled");
    }
  }

  private RechargeOrderResponse toResponse(
      BillingRechargeOrder order, String payUrl, String payScene, Long walletBalance) {
    return new RechargeOrderResponse(
        order.getOrderNo(),
        order.getStatus(),
        order.getChannel(),
        order.getPoints() != null ? order.getPoints() : 0L,
        order.getListPriceCents() != null ? order.getListPriceCents() : order.getPriceCents(),
        order.getPriceCents() != null ? order.getPriceCents() : 0L,
        order.getCurrency(),
        order.getCouponCode(),
        order.getCouponDiscountCents() != null ? order.getCouponDiscountCents() : 0L,
        payUrl,
        payScene,
        order.getExpireAt(),
        order.getPaidAt(),
        walletBalance != null ? walletBalance : 0L);
  }
}

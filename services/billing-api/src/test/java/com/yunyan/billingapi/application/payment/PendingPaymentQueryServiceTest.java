package com.yunyan.billingapi.application.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.billingapi.application.payment.provider.PaymentProviderRegistry;
import com.yunyan.billingapi.application.recharge.RechargeOrderService;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PendingPaymentQueryServiceTest {

  @Mock BillingAppProperties billingAppProperties;
  @Mock BillingAppProperties.Payment payment;
  @Mock PaymentProviderRegistry paymentProviderRegistry;
  @Mock BillingRechargeOrderMapper orderMapper;
  @Mock RechargeOrderService rechargeOrderService;

  @InjectMocks PendingPaymentQueryService pendingPaymentQueryService;

  @Test
  void pollPendingOnlinePayments_whenDisabled_returnsZero() {
    when(billingAppProperties.getPayment()).thenReturn(payment);
    when(payment.isQueryScanEnabled()).thenReturn(false);

    assertThat(pendingPaymentQueryService.pollPendingOnlinePayments(50)).isZero();
    verify(orderMapper, never()).findPendingOnlineOrders(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyInt());
  }

  @Test
  void pollPendingOnlinePayments_stubMode_returnsZero() {
    when(billingAppProperties.getPayment()).thenReturn(payment);
    when(payment.isQueryScanEnabled()).thenReturn(true);
    when(paymentProviderRegistry.isLiveMode()).thenReturn(false);

    assertThat(pendingPaymentQueryService.pollPendingOnlinePayments(50)).isZero();
    verify(orderMapper, never()).findPendingOnlineOrders(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyInt());
  }

  @Test
  void pollPendingOnlinePayments_liveModeNoPaidOrders_returnsZero() {
    when(billingAppProperties.getPayment()).thenReturn(payment);
    when(payment.isQueryScanEnabled()).thenReturn(true);
    when(paymentProviderRegistry.isLiveMode()).thenReturn(true);
    when(orderMapper.findPendingOnlineOrders(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq(50)))
        .thenReturn(List.of());

    assertThat(pendingPaymentQueryService.pollPendingOnlinePayments(50)).isZero();
  }
}

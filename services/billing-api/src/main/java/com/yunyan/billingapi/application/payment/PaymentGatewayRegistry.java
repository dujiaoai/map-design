package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.security.AuthException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PaymentGatewayRegistry {

  private final Map<String, PaymentGateway> gatewaysByChannel;

  public PaymentGatewayRegistry(List<PaymentGateway> gateways) {
    this.gatewaysByChannel =
        gateways.stream().collect(Collectors.toMap(PaymentGateway::channel, Function.identity()));
  }

  public PaymentGateway require(String channel) {
    var gateway = gatewaysByChannel.get(channel);
    if (gateway == null) {
      throw AuthException.badRequest("Unsupported payment channel: " + channel);
    }
    return gateway;
  }
}

package com.yunyan.billingapi.application.packagecatalog;

import com.yunyan.billingapi.domain.mapper.BillingRechargePackageMapper;
import com.yunyan.billingapi.web.dto.RechargePackageDto;
import com.yunyan.billingapi.web.dto.RechargePackageListResponse;
import org.springframework.stereotype.Service;

@Service
public class RechargePackageService {

  private final BillingRechargePackageMapper packageMapper;

  public RechargePackageService(BillingRechargePackageMapper packageMapper) {
    this.packageMapper = packageMapper;
  }

  public RechargePackageListResponse listActivePackages() {
    var items =
        packageMapper.findActivePackages().stream()
            .map(
                pkg ->
                    new RechargePackageDto(
                        pkg.getId(),
                        pkg.getCode(),
                        pkg.getPoints() != null ? pkg.getPoints() : 0L,
                        pkg.getPriceCents() != null ? pkg.getPriceCents() : 0L,
                        pkg.getCurrency()))
            .toList();
    return new RechargePackageListResponse(items);
  }
}

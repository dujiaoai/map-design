package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.mapper.BillingRechargePackageMapper;
import com.yunyan.billingapi.web.dto.AdminRechargePackageDto;
import com.yunyan.billingapi.web.dto.AdminRechargePackageListResponse;
import org.springframework.stereotype.Service;

@Service
public class AdminBillingPackageService {

  private final BillingRechargePackageMapper packageMapper;

  public AdminBillingPackageService(BillingRechargePackageMapper packageMapper) {
    this.packageMapper = packageMapper;
  }

  public AdminRechargePackageListResponse listPackages() {
    var items =
        packageMapper.findAllPackages().stream()
            .map(
                pkg ->
                    new AdminRechargePackageDto(
                        pkg.getId(),
                        pkg.getCode(),
                        pkg.getPoints() != null ? pkg.getPoints() : 0L,
                        pkg.getPriceCents() != null ? pkg.getPriceCents() : 0L,
                        pkg.getCurrency(),
                        pkg.getStatus(),
                        pkg.getSortOrder() != null ? pkg.getSortOrder() : 0))
            .toList();
    return new AdminRechargePackageListResponse(items);
  }
}

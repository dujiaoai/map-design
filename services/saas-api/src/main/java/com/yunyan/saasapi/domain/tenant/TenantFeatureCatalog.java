package com.yunyan.saasapi.domain.tenant;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** 可开通租户能力码目录，与 saas-web mock-nav-items tenantFeature 对齐。 */
public final class TenantFeatureCatalog {

  public record Entry(String code, String name, String description) {}

  public static final List<Entry> ENTRIES =
      List.of(
          new Entry("custom.highway-alert", "高速预警", "高速预警图层与面板"),
          new Entry("custom.live-share", "地图分享", "地图分享列表"));

  public static final Set<String> CODES =
      ENTRIES.stream()
          .map(Entry::code)
          .collect(LinkedHashSet::new, Set::add, Set::addAll);

  private TenantFeatureCatalog() {}
}

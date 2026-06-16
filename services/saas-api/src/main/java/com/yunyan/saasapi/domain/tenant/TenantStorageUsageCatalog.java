package com.yunyan.saasapi.domain.tenant;

/** 租户存储用量估算常量（附件表落地前 MVP）。 */
public final class TenantStorageUsageCatalog {

  /** 每个 map_layer 行占位 64 KiB，待附件/GeoJSON 表落地后改为真实汇总。 */
  public static final long BYTES_PER_LAYER = 64L * 1024;

  private TenantStorageUsageCatalog() {}
}

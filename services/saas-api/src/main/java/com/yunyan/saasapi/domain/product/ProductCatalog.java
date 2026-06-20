package com.yunyan.saasapi.domain.product;

import java.util.UUID;

/** 内置产品线常量，与 V68 seed 对齐。 */
public final class ProductCatalog {

  public static final UUID MAP_DESIGN_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000001");

  public static final String MAP_DESIGN_CODE = "map-design";

  private ProductCatalog() {}
}

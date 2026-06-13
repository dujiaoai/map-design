package com.yunyan.saasapi.application.tenant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.yunyan.saasapi.security.AuthException;
import org.junit.jupiter.api.Test;

class TenantSlugGeneratorTest {

  @Test
  void slugFromOrgName_normalizesSpacesAndCase() {
    assertEquals("yunyan-survey", TenantSlugGenerator.slugFromOrgName("YunYan Survey"));
  }

  @Test
  void normalizeSlug_rejectsReserved() {
    var ex =
        assertThrows(AuthException.class, () -> TenantSlugGenerator.validateSlug("admin"));
    assertEquals(400, ex.getStatus().value());
  }
}

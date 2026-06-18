package com.yunyan.saasapi.application.scim;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.scim.ScimBulkOperation;
import com.yunyan.saasapi.web.dto.scim.ScimBulkRequest;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class ScimBulkServiceTest {

  private final ScimBulkService service =
      new ScimBulkService(mock(ScimUserService.class), mock(ScimGroupService.class), new ObjectMapper());

  @Test
  void processBulk_exceedsMaxOperations_throws() {
    var ops =
        IntStream.range(0, 21)
            .mapToObj(i -> new ScimBulkOperation("POST", "/Users", "b" + i, null))
            .toList();
    assertThatThrownBy(() -> service.processBulk(UUID.randomUUID(), new ScimBulkRequest(List.of(), ops)))
        .isInstanceOf(AuthException.class);
  }
}

package com.yunyan.saasapi.application.scim;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.scim.ScimBulkOperation;
import com.yunyan.saasapi.web.dto.scim.ScimBulkOperationResult;
import com.yunyan.saasapi.web.dto.scim.ScimBulkRequest;
import com.yunyan.saasapi.web.dto.scim.ScimBulkResponse;
import com.yunyan.saasapi.web.dto.scim.ScimCreateGroupRequest;
import com.yunyan.saasapi.web.dto.scim.ScimCreateUserRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ScimBulkService {

  public static final int MAX_OPERATIONS = 20;

  private final ScimUserService scimUserService;
  private final ScimGroupService scimGroupService;
  private final ObjectMapper objectMapper;

  public ScimBulkResponse processBulk(UUID tenantId, ScimBulkRequest request) {
    if (request.operations() == null || request.operations().isEmpty()) {
      throw AuthException.badRequest("Operations are required");
    }
    if (request.operations().size() > MAX_OPERATIONS) {
      throw AuthException.badRequest("Bulk batch exceeds max " + MAX_OPERATIONS);
    }
    List<ScimBulkOperationResult> results = new ArrayList<>(request.operations().size());
    for (var op : request.operations()) {
      results.add(processOperation(tenantId, op));
    }
    return new ScimBulkResponse(
        List.of("urn:ietf:params:scim:api:messages:2.0:BulkResponse"), results);
  }

  private ScimBulkOperationResult processOperation(UUID tenantId, ScimBulkOperation op) {
    var method = op.method() == null ? "" : op.method().trim().toUpperCase();
    if (!"POST".equals(method)) {
      return failed(op, "405", "Unsupported method: " + method);
    }
    var path = op.path() == null ? "" : op.path().trim();
    try {
      if ("/Users".equalsIgnoreCase(path)) {
        var create = objectMapper.convertValue(op.data(), ScimCreateUserRequest.class);
        var resource = scimUserService.createUser(tenantId, create);
        return new ScimBulkOperationResult(
            method, op.bulkId(), "201", "/scim/v2/Users/" + resource.id(), resource);
      }
      if ("/Groups".equalsIgnoreCase(path)) {
        var create = objectMapper.convertValue(op.data(), ScimCreateGroupRequest.class);
        var resource = scimGroupService.createGroup(tenantId, create);
        return new ScimBulkOperationResult(
            method, op.bulkId(), "201", "/scim/v2/Groups/" + resource.id(), resource);
      }
      return failed(op, "404", "Unknown path: " + path);
    } catch (AuthException ex) {
      return failed(op, String.valueOf(ex.getStatus().value()), ex.getMessage());
    } catch (Exception ex) {
      return failed(op, "500", ex.getMessage());
    }
  }

  private static ScimBulkOperationResult failed(ScimBulkOperation op, String status, String message) {
    return new ScimBulkOperationResult(
        op.method(), op.bulkId(), status, null, java.util.Map.of("detail", message));
  }
}

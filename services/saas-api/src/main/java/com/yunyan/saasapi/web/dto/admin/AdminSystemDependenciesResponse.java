package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminSystemDependenciesResponse(
    List<Edge> edges, List<Node> nodes) {

  public record Edge(String from, String to, String kind) {}

  public record Node(
      String id, String label, String status, String url, String detail) {}
}

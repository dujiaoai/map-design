---
name: java-rest-api
description: >-
  Spring Boot REST API 设计与实现，对齐 map-design @repo/api-client（/v1、标准 HTTP 状态码、
  JSON body，非 RuoYi envelope）。含 Controller 规范、DTO 校验、RFC 7807 错误体、OpenAPI、
  分页与 CORS。Use when 用户写接口、Controller、API 契约、Swagger、对接前端 api-client。
---

# REST API 契约（对齐 @repo/api-client）

## 核心原则

前端 `@repo/api-client` 行为：

- `Authorization: Bearer <accessToken>`
- **成功**：`res.ok` → `JSON.parse` 直接作为 `T` 返回
- **失败**：抛 `ApiError(status, body)` — **无** `{ code: 200, msg, data }` 包裹

因此后端 **禁止** RuoYi 式 envelope。用 HTTP 状态码表达结果。

## URL 规范

| 规则 | 示例 |
| --- | --- |
| 前缀 | `/v1/...` |
| 资源复数、kebab-case | `/v1/map-workspaces` |
| 子资源 | `/v1/tenants/{tenantId}/members` |
| 动作（非 CRUD） | `POST /v1/auth/login`（动词放 auth 域） |

版本：路径版本 `v1`（与 [backend-integration.md](../../docs/architecture/backend-integration.md) 一致）。

## Controller 模板

```java
@RestController
@RequestMapping("/v1/workspaces")
@RequiredArgsConstructor
@Tag(name = "Workspaces")
public class WorkspaceController {

  private final WorkspaceService workspaceService;

  @GetMapping("/{id}")
  @Operation(summary = "获取工作台详情")
  public WorkspaceResponse get(@PathVariable UUID id) {
    return workspaceService.getById(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public WorkspaceResponse create(@Valid @RequestBody CreateWorkspaceRequest req) {
    return workspaceService.create(req);
  }
}
```

约定：

- 返回 **Response DTO**（记录类），不直接暴露 Entity
- 创建用 `201 Created`；删除成功用 `204 No Content`
- 校验：`jakarta.validation` + `@Valid`，消息 i18n 可后期补

## 错误响应（对齐 ApiError）

`packages/api-client` 在 `!res.ok` 时把 body 原样交给调用方。推荐 **RFC 7807 Problem Details**：

```json
{
  "type": "https://api.yunyan.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "name must not be blank",
  "instance": "/v1/workspaces",
  "errors": [
    { "field": "name", "message": "must not be blank" }
  ]
}
```

`GlobalExceptionHandler` 映射：

| 异常 | HTTP | type |
| --- | --- | --- |
| `MethodArgumentNotValidException` | 400 | validation |
| `EntityNotFoundException` | 404 | not-found |
| `AccessDeniedException` | 403 | forbidden |
| `AuthenticationException` | 401 | unauthorized |
| 其它未捕获 | 500 | internal（生产隐藏 detail） |

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
    var problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_REQUEST, "Validation failed");
    problem.setProperty("errors", /* field errors */);
    return ResponseEntity.badRequest().body(problem);
  }
}
```

## 认证端点（与前端 bootstrap 对齐）

目标接口（[auth-rbac.md](../../docs/architecture/auth-rbac.md)）：

| 方法 | 路径 | 响应体（成功 JSON） |
| --- | --- | --- |
| POST | `/v1/auth/login` | `{ accessToken, refreshToken, expiresIn, user }` |
| POST | `/v1/auth/refresh` | `{ accessToken, refreshToken, expiresIn }` |
| POST | `/v1/auth/logout` | `204` |
| GET | `/v1/users/me` | 当前用户 + roles |
| GET | `/v1/menus` | 导航树（替代 RuoYi getRouters） |

字段命名：**camelCase**（与 TypeScript 一致）。

## 分页

```json
{
  "items": [ ... ],
  "page": 1,
  "pageSize": 20,
  "total": 135
}
```

查询参数：`?page=1&pageSize=20&sort=createdAt,desc`

Spring 实现：`Page<T>` → 自定义 `PageResponse<T>` 记录，勿直接序列化 `PageImpl` 内部字段。

## OpenAPI

- 依赖：`springdoc-openapi-starter-webmvc-ui`
- 开发访问：`http://localhost:8082/swagger-ui.html`
- 生产：通过 profile 关闭 UI 或加 Basic Auth

```java
@Configuration
public class OpenApiConfig {
  @Bean
  OpenAPI openAPI() {
    return new OpenAPI()
        .info(new Info().title("YunYan SaaS API").version("v1"))
        .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
        .components(new Components().addSecuritySchemes("bearerAuth",
            new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
  }
}
```

可选：导出 `openapi.yaml` 供前端 `openapi-typescript` 生成类型（与 `@repo/api-client` 并存）。

## CORS（本地 dev）

```java
@Bean
CorsConfigurationSource corsConfigurationSource(
    @Value("${saas.cors.allowed-origins:http://localhost:5175}") String[] origins) {
  var config = new CorsConfiguration();
  config.setAllowedOrigins(List.of(origins));
  config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
  config.setAllowedHeaders(List.of("*"));
  config.setAllowCredentials(true);
  var source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/v1/**", config);
  return source;
}
```

## 工作流检查清单

```
- [ ] 路径以 /v1 开头
- [ ] 成功响应无 envelope 包裹
- [ ] 错误走 ProblemDetail + 正确 HTTP 状态码
- [ ] DTO 与 Entity 分离，MapStruct 转换
- [ ] OpenAPI @Operation 与 @Schema 补全
- [ ] MockMvc 测试 2xx/4xx（java-backend-testing）
- [ ] 前端 shared/queries 封装，UI 不直连（saas-fsd-feature）
```

## 反模式（禁止）

| 反模式 | 原因 |
| --- | --- |
| `{ code: 200, data: ... }` 成功体 | 与 api-client 不兼容 |
| 业务失败仍返回 HTTP 200 | 前端无法走 401 刷新链路 |
| Controller 内写 SQL | 破坏分层，难测 |
| 在 ruoyi-api 包加 SaaS 接口 | ADR-0005 边界 |

---
name: java-backend-testing
description: >-
  Java 后端测试：JUnit 5、Mockito、Spring Boot Test、MockMvc、Testcontainers（PostgreSQL/
  Redis）。Use when 用户写单元测试、集成测试、API 冒烟、CI 验证，或提到 MockMvc、
  Testcontainers、mvn test。
---

# 后端测试（JUnit 5 + MockMvc + Testcontainers）

## 测试金字塔

| 层级 | 工具 | 范围 |
| --- | --- | --- |
| 单元 | JUnit 5 + Mockito | Service 纯逻辑、Mapper mock |
| Web 切片 | `@WebMvcTest` + MockMvc | Controller 序列化、校验、401/403 |
| 集成 | `@SpringBootTest` + Testcontainers | 真实 PG/Redis + Flyway |
| 契约（可选） | SpringDoc + openapi-diff | 防破坏性 API 变更 |

默认目标：**每个 Controller 至少 1 个 MockMvc 测试**；核心 Service 单元测试；Auth 流程 1 条 Testcontainers 冒烟。

## 依赖（saas-api pom）

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>postgresql</artifactId>
  <scope>test</scope>
</dependency>
```

## MockMvc 示例（对齐 api-client 语义）

```java
@WebMvcTest(WorkspaceController.class)
@Import({ GlobalExceptionHandler.class, SecurityConfig.class })
class WorkspaceControllerTest {

  @Autowired MockMvc mockMvc;
  @MockBean WorkspaceService workspaceService;

  @Test
  @WithMockUser(roles = "MEMBER")
  void get_returns200_andJsonBody() throws Exception {
    var id = UUID.randomUUID();
    when(workspaceService.getById(id)).thenReturn(new WorkspaceResponse(id, "demo"));

    mockMvc.perform(get("/v1/workspaces/{id}", id)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(id.toString()))
        .andExpect(jsonPath("$.name").value("demo"));
        // 无 $.code / $.data 包裹
  }

  @Test
  void get_withoutAuth_returns401() throws Exception {
    mockMvc.perform(get("/v1/workspaces/{id}", UUID.randomUUID()))
        .andExpect(status().isUnauthorized());
  }
}
```

## Service 单元测试

```java
@ExtendWith(MockitoExtension.class)
class WorkspaceServiceTest {

  @Mock SysWorkspaceMapper mapper;
  @InjectMocks WorkspaceServiceImpl service;

  @Test
  void create_setsTenantFromContext() {
    try (var ignored = TenantContext.bind("tenant-1")) {
      // when / then
    }
  }
}
```

## Testcontainers 集成测试

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthIntegrationTest {

  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @DynamicPropertySource
  static void props(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
  }

  @Autowired TestRestTemplate rest;

  @Test
  void login_returnsTokens() {
    var res = rest.postForEntity("/v1/auth/login",
        Map.of("email", "admin@test.com", "password", "password"),
        Map.class);
    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(res.getBody()).containsKeys("accessToken", "refreshToken");
  }
}
```

本地需 Docker；CI 同样依赖 Docker（GitHub Actions `services:` 或 dind）。

## 测试数据

| 方式 | 场景 |
| --- | --- |
| Flyway `src/test/resources/db/migration` | 一般 **不要** 重复；共用 main 迁移 |
| `@Sql` / `test-data.sql` | 单测种子数据 |
| Test fixture Builder | 复杂实体 |

**禁止**测试依赖生产库连接。

## 命名与布局

```
src/test/java/com/yunyan/saasapi/
├── web/controller/WorkspaceControllerTest.java
├── application/WorkspaceServiceTest.java
└── integration/AuthIntegrationTest.java
```

类名：`*Test`（JUnit 5 默认）或 `*IT`（纯集成）。

## 常用命令

```bash
mvn -pl saas-api test                           # 全测试
mvn -pl saas-api -Dtest=WorkspaceControllerTest test
mvn -pl saas-api verify                         # 含 checkstyle（若配置）
```

## CI 建议（后期）

```yaml
# .github/workflows/saas-api.yml（规划）
- uses: actions/setup-java@v4
  with: { java-version: '21', distribution: 'temurin' }
- run: mvn -f services/pom.xml -pl saas-api test
```

## 工作流检查清单

```
- [ ] 成功响应断言无 RuoYi envelope
- [ ] 401/403/400 状态码与 ProblemDetail 字段
- [ ] 租户隔离：跨 tenant 访问返回 404 或 403
- [ ] Flyway 在 Testcontainers 上自动 migrate
- [ ] 测试可重复运行（无随机顺序依赖）
```

## 相关 Skill

| 场景 | Skill |
| --- | --- |
| API 形状 | `java-rest-api` |
| 登录用例 | `java-auth-security` |
| 表结构 | `java-persistence` |

前端测试仍用 `webapp-testing`（Vitest/Playwright），本 Skill 仅 **services/** 范围。

---
name: java-spring-boot-scaffold
description: >-
  在 map-design 从零脚手架 Spring Boot 3 Maven 多模块服务（services/）。含父 POM、saas-api
  模块、分层包结构、application.yml、Flyway/Redis 占位、dev profile 与本地 docker-compose。
  Use when 用户说新建 Java 项目、Spring Boot 初始化、services 目录、Maven 多模块、跑通 Hello。
---

# Spring Boot 脚手架（map-design）

## 前置

- 已读 [java-backend-index](../java-backend-index/SKILL.md)
- JDK **21**、`mvn -v` 可用
- 目标目录：`services/`（仓库根，与 `apps/` 并列）

## 标准工作流

```
- [ ] 1. 创建 services/ 父 POM + saas-api 子模块
- [ ] 2. 配置 Spring Boot 3.3、Java 21、依赖 BOM
- [ ] 3. 建立分层包 + SaasApiApplication 入口
- [ ] 4. application.yml（dev/prod profile）
- [ ] 5. docker-compose.dev.yml（PostgreSQL + Redis）
- [ ] 6. mvn spring-boot:run 验证 /actuator/health
```

## 父 POM 要点

`services/pom.xml`：

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.yunyan</groupId>
  <artifactId>saas-services</artifactId>
  <version>0.1.0-SNAPSHOT</version>
  <packaging>pom</packaging>
  <modules>
    <module>saas-api</module>
  </modules>
  <properties>
    <java.version>21</java.version>
    <spring-boot.version>3.3.6</spring-boot.version>
    <mybatis-plus.version>3.5.9</mybatis-plus.version>
    <mapstruct.version>1.6.3</mapstruct.version>
  </properties>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-dependencies</artifactId>
        <version>${spring-boot.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
</project>
```

## saas-api 模块依赖（starter 清单）

| 依赖 | 用途 |
| --- | --- |
| `spring-boot-starter-web` | REST |
| `spring-boot-starter-validation` | `@Valid` |
| `spring-boot-starter-security` | 鉴权（见 java-auth-security） |
| `spring-boot-starter-actuator` | health、metrics |
| `spring-boot-starter-data-redis` | 缓存/验证码 |
| `mybatis-plus-spring-boot3-starter` | ORM |
| `postgresql` | JDBC |
| `flyway-core` + `flyway-database-postgresql` | 迁移 |
| `springdoc-openapi-starter-webmvc-ui` | OpenAPI |
| `mapstruct` + `lombok` | 编译期生成 |
| `spring-boot-starter-test` | 测试 |

## 包结构（推荐）

```
com.yunyan.saasapi
├── SaasApiApplication.java
├── config/           # Security、MyBatis、OpenAPI、Cors
├── web/
│   ├── controller/   # *Controller
│   ├── dto/          # Request/Response 记录
│   └── advice/       # GlobalExceptionHandler
├── application/      # *Service 接口与实现
├── domain/
│   ├── entity/       # 表映射实体
│   └── mapper/       # MyBatis-Plus BaseMapper
└── security/         # Jwt、UserDetails、TenantContext
```

采用 **轻量分层**（非严格 DDD）：Controller 薄、Service 承载业务、Mapper 仅数据访问。

## application.yml 模板

```yaml
spring:
  application:
    name: saas-api
  profiles:
    active: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/saas
    username: saas
    password: saas
  flyway:
    enabled: true
    locations: classpath:db/migration
  data:
    redis:
      host: localhost
      port: 6379

server:
  port: 8082
  servlet:
    context-path: /

management:
  endpoints:
    web:
      exposure:
        include: health,info

saas:
  jwt:
    issuer: yunyan-saas
    access-ttl: PT15M
    refresh-ttl: P7D
```

**端口 8082**：避免与 `docker-deploy` 的 saas-web :8084 冲突。前端 dev 代理：

```ts
// apps/web/vite.config.ts — 规划项
proxy: {
  '/v1': { target: 'http://localhost:8082', changeOrigin: true },
}
```

## docker-compose.dev.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: saas
      POSTGRES_USER: saas
      POSTGRES_PASSWORD: saas
    ports: ["5432:5432"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

启动：`docker compose -f services/docker-compose.dev.yml up -d`

## 启动验证

```bash
cd services/saas-api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
curl http://localhost:8082/actuator/health
```

## 常用命令

```bash
mvn -f services/pom.xml clean verify          # 全模块构建+测试
mvn -pl saas-api spring-boot:run              # 仅 API 服务
mvn -pl saas-api -Dtest='*Test' test          # 单模块测试
```

## 扩展模块（后期）

| 模块 | 场景 |
| --- | --- |
| `saas-common` | 共享 DTO、异常、工具 |
| `saas-gateway` | Spring Cloud Gateway 多服务聚合 |
| `saas-worker` | 异步任务、定时 Job |

新增模块：父 POM `<modules>` 登记 → 子模块 `pom.xml` 继承 parent。

## 下一步

| 完成后 | Skill |
| --- | --- |
| 健康检查通过 | `java-persistence` — 基线表 |
| 需要登录 | `java-auth-security` |
| 暴露业务 API | `java-rest-api` |

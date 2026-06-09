package com.yunyan.saasapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  OpenAPI openAPI() {
    var bearer =
        new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .description("先调用 POST /v1/auth/login 获取 accessToken，再点击 Authorize 填入");

    return new OpenAPI()
        .info(
            new Info()
                .title("YunYan SaaS API")
                .version("v1")
                .description(
                    """
                    map-design 目标后端 REST API（无 RuoYi envelope）。

                    **联调流程**
                    1. `POST /v1/auth/login` 获取 `accessToken`
                    2. 点击右上角 **Authorize**，填入 `Bearer <accessToken>` 或仅 token（Swagger 会自动加 Bearer 前缀）
                    3. 调用受保护接口（Users、Tenants 等）

                    演示账号（需先执行 seed-demo-dev.sql）：`admin@demo.local` / `password` / tenant `demo`
                    """))
        .servers(List.of(new Server().url("http://localhost:8082").description("本地开发")))
        .tags(
            List.of(
                new Tag().name("Auth").description("认证：登录、刷新、登出"),
                new Tag().name("Users").description("当前登录用户与会话"),
                new Tag().name("Tenants").description("可访问租户列表（TeamSwitcher）"),
                new Tag().name("System").description("存活探测")))
        .components(new Components().addSecuritySchemes("bearerAuth", bearer));
  }
}

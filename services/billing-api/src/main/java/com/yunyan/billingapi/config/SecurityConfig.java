package com.yunyan.billingapi.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.security.AccessTokenDenylist;
import com.yunyan.billingapi.security.InternalAuthFilter;
import com.yunyan.billingapi.security.JwtAuthFilter;
import com.yunyan.billingapi.security.TenantRlsScopeFilter;
import com.yunyan.billingapi.security.JwtService;
import com.yunyan.billingapi.security.SecurityProblemWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  InternalAuthFilter internalAuthFilter(
      BillingAppProperties billingAppProperties, ObjectMapper objectMapper) {
    return new InternalAuthFilter(billingAppProperties, objectMapper);
  }

  @Bean
  JwtAuthFilter jwtAuthFilter(
      JwtService jwtService, AccessTokenDenylist accessTokenDenylist, ObjectMapper objectMapper) {
    return new JwtAuthFilter(jwtService, accessTokenDenylist, objectMapper);
  }

  @Bean
  TenantRlsScopeFilter tenantRlsScopeFilter() {
    return new TenantRlsScopeFilter();
  }

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtAuthFilter jwtAuthFilter,
      InternalAuthFilter internalAuthFilter,
      TenantRlsScopeFilter tenantRlsScopeFilter,
      ObjectMapper objectMapper)
      throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .requestMatchers(HttpMethod.GET, "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                .permitAll()
            .requestMatchers(HttpMethod.GET, "/v1/ping").permitAll()
            .requestMatchers("/v1/billing/webhooks/**").permitAll()
            .requestMatchers("/internal/**").permitAll()
            .requestMatchers("/v1/admin/billing/**").authenticated()
            .requestMatchers("/v1/billing/**").authenticated()
            .anyRequest().permitAll())
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(
                        (req, res, e) ->
                            SecurityProblemWriter.writeUnauthorized(res, objectMapper))
                    .accessDeniedHandler(
                        (req, res, e) -> SecurityProblemWriter.writeForbidden(res, objectMapper)))
        .httpBasic(basic -> basic.disable())
        .formLogin(form -> form.disable())
        .addFilterBefore(internalAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterAfter(tenantRlsScopeFilter, JwtAuthFilter.class)
        .build();
  }
}

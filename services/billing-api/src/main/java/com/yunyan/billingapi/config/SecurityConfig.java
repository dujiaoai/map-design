package com.yunyan.billingapi.config;

import com.yunyan.billingapi.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter)
      throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .requestMatchers(HttpMethod.GET, "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                .permitAll()
            .requestMatchers(HttpMethod.GET, "/v1/ping").permitAll()
            .requestMatchers("/v1/billing/**").authenticated()
            .anyRequest().permitAll())
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((req, res, e) -> res.sendError(401))
            .accessDeniedHandler((req, res, e) -> res.sendError(403)))
        .httpBasic(basic -> basic.disable())
        .formLogin(form -> form.disable())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}

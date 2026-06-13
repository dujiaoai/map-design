package com.yunyan.saasapi.config;

import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http, JwtAuthFilter jwtAuthFilter, CorsConfigurationSource corsConfigurationSource)
      throws Exception {
    return http
        .cors(cors -> cors.configurationSource(corsConfigurationSource))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers(HttpMethod.GET, "/v1/ping").permitAll()
            .requestMatchers(HttpMethod.GET, "/v1/auth/invite-links/preview").permitAll()
            .requestMatchers(HttpMethod.POST, "/v1/auth/login", "/v1/auth/register", "/v1/auth/register-org", "/v1/auth/register/confirm", "/v1/auth/register/resend", "/v1/auth/refresh", "/v1/auth/accept-invite", "/v1/auth/join-via-invite-link", "/v1/auth/password-reset/request", "/v1/auth/password-reset/confirm")
                .permitAll()
            .requestMatchers(HttpMethod.GET, "/v1/admin/ping").permitAll()
            .requestMatchers("/v1/admin/**")
                .hasAnyAuthority(PermissionCodes.ADMIN_GATE_AUTHORITIES)
            .anyRequest().authenticated())
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((req, res, e) -> res.sendError(401))
            .accessDeniedHandler((req, res, e) -> res.sendError(403)))
        .httpBasic(basic -> basic.disable())
        .formLogin(form -> form.disable())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}

package com.yunyan.billingapi.security;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record SaasPrincipal(
    UUID userId,
    UUID tenantId,
    String email,
    List<String> roleCodes,
    List<String> permissionCodes,
    String accessTokenJti,
    Instant accessTokenExpiresAt)
    implements UserDetails {

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Set<String> authorityCodes = new LinkedHashSet<>();
    roleCodes.forEach(role -> authorityCodes.add(RoleCodes.toSpringAuthority(role)));
    authorityCodes.addAll(permissionCodes);

    List<GrantedAuthority> authorities = new ArrayList<>(authorityCodes.size());
    for (String code : authorityCodes) {
      authorities.add(new SimpleGrantedAuthority(code));
    }
    return authorities;
  }

  @Override
  public String getPassword() {
    return "";
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}

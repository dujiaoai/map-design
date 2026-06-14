package com.yunyan.saasapi.web.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.lessThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.yunyan.saasapi.security.AccessTokenDenylist;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = "/sql/auth-test-seed.sql")
class AuthControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Autowired
  JdbcTemplate jdbcTemplate;

  @Autowired
  AccessTokenDenylist accessTokenDenylist;

  @Test
  void protectedEndpoint_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/users/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void login_clearsStaleUserDenylist() throws Exception {
    var userId = UUID.fromString("22222222-2222-2222-2222-222222222201");
    accessTokenDenylist.denyUser(userId, Duration.ofMinutes(15));

    var accessToken = JsonPath.read(loginAndGetBody(), "$.accessToken");

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value("admin@test.local"));
  }

  @Test
  void register_withValidRequest_sendsVerificationAndConfirmAllowsLogin() throws Exception {
    var email = "register-" + System.currentTimeMillis() + "@test.local";

    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password",
                            "tenantId", "test",
                            "displayName", "Registered User"))))
        .andExpect(status().isNoContent());

    var payload =
        jdbcTemplate.queryForObject(
            "SELECT payload_json FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification' ORDER BY created_at DESC LIMIT 1",
            String.class,
            email);
    var verifyUrl = objectMapper.readTree(payload).get("verifyUrl").asText();
    var token = verifyUrl.substring(verifyUrl.indexOf("token=") + "token=".length());

    mockMvc
        .perform(
            post("/v1/auth/register/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", token))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.refreshToken").isNotEmpty())
        .andExpect(jsonPath("$.user.email").value(email))
        .andExpect(jsonPath("$.user.name").value("Registered User"))
        .andExpect(jsonPath("$.user.roles", hasItem("MEMBER")))
        .andExpect(jsonPath("$.user.tenant.slug").value("test"));
  }

  @Test
  void register_pendingUserCannotLogin() throws Exception {
    var email = "pending-" + System.currentTimeMillis() + "@test.local";

    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Email not verified, check your inbox to complete registration"));
  }

  @Test
  void registerResend_forUnverifiedUser_sendsNewVerificationEmail() throws Exception {
    var email = "resend-" + System.currentTimeMillis() + "@test.local";

    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isNoContent());

    var countBefore =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification'",
            Integer.class,
            email);

    mockMvc
        .perform(
            post("/v1/auth/register/resend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", email, "tenantId", "test"))))
        .andExpect(status().isNoContent());

    var countAfter =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification'",
            Integer.class,
            email);
    assertTrue(countAfter > countBefore);
  }

  @Test
  void registerResend_forActiveUser_returns204WithoutNewEmail() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/register/resend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "tenantId", "test"))))
        .andExpect(status().isNoContent());

    var count =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification'",
            Integer.class,
            "admin@test.local");
    assertEquals(0, count);
  }

  @Test
  void register_withDuplicateEmail_returns409() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.title").value("Conflict"));
  }

  @Test
  void register_withMixedCaseDuplicateEmail_returns409() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "Admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Email already registered for this tenant"));
  }

  @Test
  void register_withMixedCaseEmail_confirmAndLogin() throws Exception {
    var ts = System.currentTimeMillis();
    var normalizedEmail = "case-" + ts + "@test.local";
    var mixedCaseEmail = "CASE-" + ts + "@test.local";

    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", mixedCaseEmail,
                            "password", "password",
                            "tenantId", "test",
                            "displayName", "Mixed Case User"))))
        .andExpect(status().isNoContent());

    var payload =
        jdbcTemplate.queryForObject(
            "SELECT payload_json FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification' ORDER BY created_at DESC LIMIT 1",
            String.class,
            normalizedEmail);
    var verifyUrl = objectMapper.readTree(payload).get("verifyUrl").asText();
    var token = verifyUrl.substring(verifyUrl.indexOf("token=") + "token=".length());

    mockMvc
        .perform(
            post("/v1/auth/register/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", token))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value(normalizedEmail));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", mixedCaseEmail,
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value(normalizedEmail));
  }

  @Test
  void register_withUnknownTenant_returns404() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "orphan@test.local",
                            "password", "password",
                            "tenantId", "no-such-tenant"))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.detail").value("Tenant not found"));
  }

  @Test
  void login_withValidCredentials_returnsFlatTokensAndUser() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.refreshToken").isNotEmpty())
        .andExpect(jsonPath("$.expiresIn").isNumber())
        .andExpect(jsonPath("$.user.email").value("admin@test.local"))
        .andExpect(jsonPath("$.user.roles", hasItem("TENANT_ADMIN")))
        .andExpect(jsonPath("$.user.tenant.slug").value("test"));
  }

  @Test
  void login_withWrongPassword_returns401() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "wrong",
                            "tenantId", "test"))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void login_withSuspendedTenant_returns403() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "suspended-tenant@test.local",
                            "password", "password",
                            "tenantId", "suspended"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Tenant is suspended"));
  }

  @Test
  void login_withDisabledAccountAndCorrectPassword_returns403() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "disabled@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Account is disabled"));
  }

  @Test
  void login_withDisabledAccountAndWrongPassword_returns401() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "disabled@test.local",
                            "password", "wrong",
                            "tenantId", "test"))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void login_withMixedCaseEmail_returns200() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "ADMIN@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value("admin@test.local"));
  }

  @Test
  @Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/tenants-multi-membership-seed.sql"})
  void login_withoutTenantWhenMultipleMemberships_returns400() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", "admin@test.local", "password", "password"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Tenant slug is required"));
  }

  @Test
  void usersMe_withAccessToken_returns200() throws Exception {
    var loginBody =
        mockMvc
            .perform(
                post("/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", "admin@test.local",
                                "password", "password",
                                "tenantId", "test"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var accessToken = JsonPath.read(loginBody, "$.accessToken");

    var now = System.currentTimeMillis();
    var maxExpiresAt = now + 16 * 60 * 1000L;

    mockMvc
        .perform(
            get("/v1/users/me").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value("admin@test.local"))
        .andExpect(jsonPath("$.user.roles", hasItem("TENANT_ADMIN")))
        .andExpect(jsonPath("$.tenant.slug").value("test"))
        .andExpect(jsonPath("$.expiresAt").value(greaterThan(now)))
        .andExpect(jsonPath("$.expiresAt").value(lessThan(maxExpiresAt)));
  }

  @Test
  void logout_withoutToken_returns401() throws Exception {
    mockMvc.perform(post("/v1/auth/logout")).andExpect(status().isUnauthorized());
  }

  @Test
  void logout_withAccessToken_returns204AndRevokesRefresh() throws Exception {
    var loginBody = loginAndGetBody();
    var accessToken = JsonPath.read(loginBody, "$.accessToken");
    var refreshToken = JsonPath.read(loginBody, "$.refreshToken");

    mockMvc
        .perform(
            post("/v1/auth/logout").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isUnauthorized());

    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void refresh_withBlankRefreshToken_returns400() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", ""))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Validation failed"));
  }

  @Test
  void refresh_withInvalidToken_returns401() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", "not-a-jwt"))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void refresh_gracePeriod_allowsIdempotentReuseOfConsumedRefresh() throws Exception {
    var loginBody = loginAndGetBody();
    var refreshToken = JsonPath.read(loginBody, "$.refreshToken");

    var firstRefreshBody =
        mockMvc
            .perform(
                post("/v1/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var rotatedAccessToken = JsonPath.read(firstRefreshBody, "$.accessToken");
    var rotatedRefreshToken = JsonPath.read(firstRefreshBody, "$.refreshToken");

    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").value(rotatedAccessToken))
        .andExpect(jsonPath("$.refreshToken").value(rotatedRefreshToken));
  }

  @Test
  void refresh_withValidToken_returnsNewTokens() throws Exception {
    var loginBody =
        mockMvc
            .perform(
                post("/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", "admin@test.local",
                                "password", "password",
                                "tenantId", "test"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var refreshToken = JsonPath.read(loginBody, "$.refreshToken");

    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.refreshToken").isNotEmpty())
        .andExpect(jsonPath("$.expiresIn").isNumber());
  }

  @Test
  void passwordResetRequest_unknownEmail_returns204() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "missing-" + System.currentTimeMillis() + "@test.local",
                            "tenantId", "test"))))
        .andExpect(status().isNoContent());
  }

  @Test
  void passwordResetRequest_activeUser_createsOutboxAndConfirmAllowsLogin() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", "admin@test.local", "tenantId", "test"))))
        .andExpect(status().isNoContent());

    var payload =
        jdbcTemplate.queryForObject(
            "SELECT payload_json FROM sys_email_outbox WHERE to_email = ? AND template = 'password-reset' ORDER BY created_at DESC LIMIT 1",
            String.class,
            "admin@test.local");
    var resetUrl = objectMapper.readTree(payload).get("resetUrl").asText();
    var token = resetUrl.substring(resetUrl.indexOf("token=") + "token=".length());

    var loginBody =
        mockMvc
            .perform(
                post("/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", "admin@test.local",
                                "password", "password",
                                "tenantId", "test"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var refreshToken = JsonPath.read(loginBody, "$.refreshToken");

    mockMvc
        .perform(
            post("/v1/auth/password-reset/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("token", token, "password", "resetpass1"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.user.email").value("admin@test.local"));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isUnauthorized());

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "resetpass1",
                            "tenantId", "test"))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void passwordResetRequest_disabledUser_returns204WithoutOutbox() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", "disabled@test.local", "tenantId", "test"))))
        .andExpect(status().isNoContent());

    var count =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'password-reset'",
            Integer.class,
            "disabled@test.local");
    org.junit.jupiter.api.Assertions.assertEquals(0, count);
  }

  @Test
  void passwordResetConfirm_invalidToken_returns400() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/password-reset/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("token", "invalid-token", "password", "newpassword1"))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void registerOrg_createsTenantAndTenantAdmin() throws Exception {
    var email = "org-owner-" + System.currentTimeMillis() + "@test.local";
    var orgName = "New Survey Co " + System.currentTimeMillis();

    var body =
        mockMvc
            .perform(
                post("/v1/auth/register-org")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "orgName", orgName,
                                "email", email,
                                "password", "password",
                                "displayName", "Org Owner"))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.orgName").value(orgName))
            .andExpect(jsonPath("$.tenantSlug").isString())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var tenantSlug = JsonPath.read(body, "$.tenantSlug");

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "password",
                            "tenantId", tenantSlug))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Email not verified, check your inbox to complete registration"));

    var payload =
        jdbcTemplate.queryForObject(
            "SELECT payload_json FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification' ORDER BY created_at DESC LIMIT 1",
            String.class,
            email);
    var verifyUrl = objectMapper.readTree(payload).get("verifyUrl").asText();
    var token = verifyUrl.substring(verifyUrl.indexOf("token=") + "token=".length());

    mockMvc
        .perform(
            post("/v1/auth/register/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", token))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value(email))
        .andExpect(jsonPath("$.user.roles", hasItem("TENANT_ADMIN")))
        .andExpect(jsonPath("$.user.tenant.slug").value(tenantSlug));
  }

  @Test
  void registerOrg_withExplicitSlug_usesSlug() throws Exception {
    var slug = "acme-" + System.currentTimeMillis();
    var email = "acme-owner-" + System.currentTimeMillis() + "@test.local";

    mockMvc
        .perform(
            post("/v1/auth/register-org")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "orgName", "Acme Survey",
                            "slug", slug,
                            "email", email,
                            "password", "password"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.tenantSlug").value(slug));
  }

  @Test
  @Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/reset-role-permissions.sql"})
  void joinViaInviteLink_createsActiveUserAndAllowsLogin() throws Exception {
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/11111111-1111-1111-1111-111111111101/invite-links")
                    .header(
                        "Authorization",
                        "Bearer "
                            + JsonPath.read(
                                mockMvc
                                    .perform(
                                        post("/v1/auth/login")
                                            .contentType(MediaType.APPLICATION_JSON)
                                            .content(
                                                objectMapper.writeValueAsString(
                                                    Map.of(
                                                        "email",
                                                        "admin@test.local",
                                                        "password",
                                                        "password",
                                                        "tenantId",
                                                        "test"))))
                                    .andExpect(status().isOk())
                                    .andReturn()
                                    .getResponse()
                                    .getContentAsString(),
                                "$.accessToken"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("roleCode", "MEMBER"))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var inviteUrl = JsonPath.read(createBody, "$.inviteUrl").toString();
    var token = inviteUrl.substring(inviteUrl.indexOf("token=") + "token=".length());
    var email = "join-link-" + System.currentTimeMillis() + "@test.local";

    mockMvc
        .perform(get("/v1/auth/invite-links/preview").param("token", token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenantSlug").value("test"))
        .andExpect(jsonPath("$.roleCode").value("MEMBER"));

    mockMvc
        .perform(
            post("/v1/auth/join-via-invite-link")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("token", token, "email", email, "password", "password"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value(email))
        .andExpect(jsonPath("$.user.roles", hasItem("MEMBER")));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", email, "password", "password", "tenantId", "test"))))
        .andExpect(status().isOk());
  }

  @Test
  void registerPersonal_createsPersonalTenantAndMember() throws Exception {
    var email = "personal-user-" + System.currentTimeMillis() + "@test.local";

    var body =
        mockMvc
            .perform(
                post("/v1/auth/register-personal")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", email,
                                "password", "password",
                                "displayName", "Solo User"))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.workspaceName").value("个人空间"))
            .andExpect(jsonPath("$.tenantSlug").isString())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var tenantSlug = JsonPath.read(body, "$.tenantSlug");

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", email, "password", "password"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Email not verified, check your inbox to complete registration"));

    var payload =
        jdbcTemplate.queryForObject(
            "SELECT payload_json FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification' ORDER BY created_at DESC LIMIT 1",
            String.class,
            email);
    var verifyUrl = objectMapper.readTree(payload).get("verifyUrl").asText();
    var token = verifyUrl.substring(verifyUrl.indexOf("token=") + "token=".length());

    mockMvc
        .perform(
            post("/v1/auth/register/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", token))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value(email))
        .andExpect(jsonPath("$.user.roles", hasItem("MEMBER")))
        .andExpect(jsonPath("$.user.tenant.slug").value(tenantSlug));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", email, "password", "password"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.tenant.slug").value(tenantSlug));

    var tenantKind =
        jdbcTemplate.queryForObject(
            "SELECT tenant_kind FROM sys_tenant WHERE slug = ?", String.class, tenantSlug);
    assertEquals("personal", tenantKind);
  }

  @Test
  void registerPersonal_duplicateEmail_returns409() throws Exception {
    var email = "personal-dup-" + System.currentTimeMillis() + "@test.local";
    var request =
        Map.of(
            "email", email,
            "password", "password");

    mockMvc
        .perform(
            post("/v1/auth/register-personal")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/v1/auth/register-personal")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.detail").value("Personal workspace already exists for this email"));
  }

  private String loginAndGetBody() throws Exception {
    return mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }
}

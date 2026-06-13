package com.yunyan.saasapi.application.email;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.EmailOutboxRepository;
import com.yunyan.saasapi.domain.entity.SysEmailOutbox;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class EmailDeliveryService {

  private static final Logger log = LoggerFactory.getLogger(EmailDeliveryService.class);

  private final JavaMailSender mailSender;
  private final SaasAppProperties saasAppProperties;
  private final EmailOutboxRepository emailOutboxRepository;
  private final ObjectMapper objectMapper;

  public UUID queueInviteEmail(
      UUID tenantId,
      UUID userId,
      String toEmail,
      String tenantName,
      String inviteUrl) {
    var outbox = new SysEmailOutbox();
    outbox.setId(UUID.randomUUID());
    outbox.setTenantId(tenantId);
    outbox.setUserId(userId);
    outbox.setTemplate("member-invite");
    outbox.setToEmail(toEmail);
    outbox.setPayloadJson(writePayload(Map.of("tenantName", tenantName, "inviteUrl", inviteUrl)));
    outbox.setStatus("pending");
    outbox.setCreatedAt(Instant.now());
    emailOutboxRepository.insert(outbox);
    deliverInvite(outbox.getId(), toEmail, tenantName, inviteUrl);
    return outbox.getId();
  }

  public UUID queuePasswordResetEmail(
      UUID tenantId,
      UUID userId,
      String toEmail,
      String tenantName,
      String resetUrl) {
    var outbox = new SysEmailOutbox();
    outbox.setId(UUID.randomUUID());
    outbox.setTenantId(tenantId);
    outbox.setUserId(userId);
    outbox.setTemplate("password-reset");
    outbox.setToEmail(toEmail);
    outbox.setPayloadJson(writePayload(Map.of("tenantName", tenantName, "resetUrl", resetUrl)));
    outbox.setStatus("pending");
    outbox.setCreatedAt(Instant.now());
    emailOutboxRepository.insert(outbox);
    deliverPasswordReset(outbox.getId(), toEmail, tenantName, resetUrl);
    return outbox.getId();
  }

  public UUID queueRegisterVerificationEmail(
      UUID tenantId,
      UUID userId,
      String toEmail,
      String tenantName,
      String verifyUrl) {
    var outbox = new SysEmailOutbox();
    outbox.setId(UUID.randomUUID());
    outbox.setTenantId(tenantId);
    outbox.setUserId(userId);
    outbox.setTemplate("register-verification");
    outbox.setToEmail(toEmail);
    outbox.setPayloadJson(writePayload(Map.of("tenantName", tenantName, "verifyUrl", verifyUrl)));
    outbox.setStatus("pending");
    outbox.setCreatedAt(Instant.now());
    emailOutboxRepository.insert(outbox);
    deliverRegisterVerification(outbox.getId(), toEmail, tenantName, verifyUrl);
    return outbox.getId();
  }

  private void deliverRegisterVerification(
      UUID outboxId, String toEmail, String tenantName, String verifyUrl) {
    if (!saasAppProperties.getMail().isEnabled()) {
      log.info("Mail disabled — register verification link for {}: {}", toEmail, verifyUrl);
      emailOutboxRepository.markSent(outboxId);
      return;
    }

    try {
      var message = new SimpleMailMessage();
      message.setFrom(saasAppProperties.getMail().getFrom());
      message.setTo(toEmail);
      message.setSubject("云眼地图 · 验证邮箱并完成注册");
      message.setText(
          """
          您好，

          感谢注册加入租户「%s」。

          请点击以下链接验证邮箱并激活账号（链接 24 小时内有效）：
          %s

          如非本人操作，请忽略此邮件。
          """
              .formatted(tenantName, verifyUrl));
      mailSender.send(message);
      emailOutboxRepository.markSent(outboxId);
    } catch (MailException ex) {
      log.warn("Failed to send register verification email to {}: {}", toEmail, ex.getMessage());
      emailOutboxRepository.markFailed(outboxId, truncate(ex.getMessage()));
    }
  }

  private void deliverPasswordReset(UUID outboxId, String toEmail, String tenantName, String resetUrl) {
    if (!saasAppProperties.getMail().isEnabled()) {
      log.info("Mail disabled — password reset link for {}: {}", toEmail, resetUrl);
      emailOutboxRepository.markSent(outboxId);
      return;
    }

    try {
      var message = new SimpleMailMessage();
      message.setFrom(saasAppProperties.getMail().getFrom());
      message.setTo(toEmail);
      message.setSubject("云眼地图 · 重置密码");
      message.setText(
          """
          您好，

          我们收到了重置您在租户「%s」账号密码的请求。

          请点击以下链接设置新密码（链接 1 小时内有效）：
          %s

          如非本人操作，请忽略此邮件，您的密码不会变更。
          """
              .formatted(tenantName, resetUrl));
      mailSender.send(message);
      emailOutboxRepository.markSent(outboxId);
    } catch (MailException ex) {
      log.warn("Failed to send password reset email to {}: {}", toEmail, ex.getMessage());
      emailOutboxRepository.markFailed(outboxId, truncate(ex.getMessage()));
    }
  }

  private void deliverInvite(UUID outboxId, String toEmail, String tenantName, String inviteUrl) {
    if (!saasAppProperties.getMail().isEnabled()) {
      log.info("Mail disabled — invite link for {}: {}", toEmail, inviteUrl);
      emailOutboxRepository.markSent(outboxId);
      return;
    }

    try {
      var message = new SimpleMailMessage();
      message.setFrom(saasAppProperties.getMail().getFrom());
      message.setTo(toEmail);
      message.setSubject("云眼地图 · 加入 " + tenantName);
      message.setText(
          """
          您好，

          您已被邀请加入租户「%s」。

          请点击以下链接设置密码并激活账号（链接 48 小时内有效）：
          %s

          如非本人操作，请忽略此邮件。
          """
              .formatted(tenantName, inviteUrl));
      mailSender.send(message);
      emailOutboxRepository.markSent(outboxId);
    } catch (MailException ex) {
      log.warn("Failed to send invite email to {}: {}", toEmail, ex.getMessage());
      emailOutboxRepository.markFailed(outboxId, truncate(ex.getMessage()));
    }
  }

  private String writePayload(Map<String, String> payload) {
    try {
      return objectMapper.writeValueAsString(payload);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize email payload", e);
    }
  }

  private static String truncate(String message) {
    if (!StringUtils.hasText(message)) {
      return "send failed";
    }
    return message.length() > 500 ? message.substring(0, 500) : message;
  }
}

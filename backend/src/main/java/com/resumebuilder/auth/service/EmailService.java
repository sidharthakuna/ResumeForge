package com.resumebuilder.auth.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String configuredUsername;

    /**
     * Send Verification OTP email for account activation.
     */
    public void sendVerificationOtpEmail(String toEmail, String otpCode) {
        String subject = "Verify Your ResumeForge Account - OTP: " + otpCode;
        String htmlContent = buildEmailTemplate(
                "Verify Your ResumeForge Account",
                "Thank you for joining ResumeForge. Use the one-time verification code below to activate your account:",
                otpCode,
                "This code will expire in 10 minutes. If you did not sign up for ResumeForge, you can safely ignore this email."
        );

        sendEmail(toEmail, subject, htmlContent, otpCode, "REGISTRATION");
    }

    /**
     * Send Password Reset OTP email.
     */
    public void sendPasswordResetOtpEmail(String toEmail, String otpCode) {
        String subject = "Reset Your ResumeForge Password - OTP: " + otpCode;
        String htmlContent = buildEmailTemplate(
                "Password Reset Request",
                "We received a request to reset your ResumeForge password. Use the one-time code below to proceed with resetting your password:",
                otpCode,
                "This code will expire in 10 minutes. If you did not request a password reset, please secure your account immediately."
        );

        sendEmail(toEmail, subject, htmlContent, otpCode, "PASSWORD_RESET");
    }

    @Async
    public void sendEmail(String toEmail, String subject, String htmlBody, String rawOtp, String purpose) {
        log.info("==================================================================");
        log.info("[ResumeForge Email Service] OTP Dispatch for {} ({})", toEmail, purpose);
        log.info(" >>> YOUR ONE-TIME PASSCODE (OTP): {} <<<", rawOtp);
        log.info("==================================================================");

        if (mailSender == null || configuredUsername == null || configuredUsername.isBlank()) {
            log.warn("JavaMailSender or mail username not configured. OTP logged to console above.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(configuredUsername.trim(), "ResumeForge");
            helper.setTo(toEmail.trim());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("HTML email successfully dispatched to {} via SMTP", toEmail);
        } catch (Exception ex) {
            log.error("Could not dispatch email via SMTP to {}: {}. Development fallback: OTP is {}", toEmail, ex.getMessage(), rawOtp, ex);
        }

    }

    private String buildEmailTemplate(String heading, String message, String otp, String footnote) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>%s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
              <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
                <tr>
                  <td align="center">
                    <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
                      <!-- Header -->
                      <tr>
                        <td style="background:#4f46e5;padding:28px 32px;text-align:center;">
                          <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">ResumeForge</h1>
                          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.85);">AI-Powered Resume Optimization</p>
                        </td>
                      </tr>
                      <!-- Body -->
                      <tr>
                        <td style="padding:32px;">
                          <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0f172a;">%s</h2>
                          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">%s</p>
                          
                          <!-- OTP Box -->
                          <div style="background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
                            <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;display:block;margin-bottom:8px;">Your Verification Code</span>
                            <span style="font-family:'SF Mono',Consolas,Monaco,monospace;font-size:32px;font-weight:800;letter-spacing:6px;color:#4f46e5;">%s</span>
                          </div>
                          
                          <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">%s</p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                          <p style="margin:0;font-size:11px;color:#94a3b8;">© %d ResumeForge. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(
                heading,
                heading,
                message,
                otp,
                footnote,
                java.time.Year.now().getValue()
        );
    }
}

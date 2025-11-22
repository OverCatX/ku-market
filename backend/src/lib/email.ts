import nodemailer from "nodemailer";
import { logger } from "./logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    // Verify transporter configuration
    const smtpEmail = process.env.SMTP_EMAIL?.trim() || process.env.SMTP_USER?.trim();
    const smtpPassword = process.env.SMTP_PASSWORD?.trim() || process.env.SMTP_PASS?.trim();
    
    if (!smtpEmail || !smtpPassword) {
      logger.warn("SMTP credentials not configured. Email will not be sent.");
      logger.log("Email that would be sent:", { to, subject });
      return;
    }
    
    // Create transporter with Gmail defaults
    const emailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const info = await emailTransporter.sendMail({
      from: `"KU Market" <${smtpEmail}>`,
      to,
      subject,
      html,
    });

    logger.log("Email sent successfully:", info.messageId);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - KU Market</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #69773D; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #f5f5dc; margin: 0;">KU Market</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
        <h2 style="color: #69773D; margin-top: 0;">Password Reset Request</h2>
        ${userName ? `<p>Hello ${userName},</p>` : "<p>Hello,</p>"}
        <p>We received a request to reset your password for your KU Market account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #69773D; color: #f5f5dc; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
          <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Best regards,<br>
          KU Market Team
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Reset Your Password - KU Market",
    html,
  });
}

export async function sendPasswordResetOtp(
  email: string,
  otp: string,
  userName?: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP - KU Market</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #69773D; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #f5f5dc; margin: 0;">KU Market</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
        <h2 style="color: #69773D; margin-top: 0;">Password Reset OTP</h2>
        ${userName ? `<p>Hello ${userName},</p>` : "<p>Hello,</p>"}
        <p>We received a request to reset your password for your KU Market account.</p>
        <p>Your OTP (One-Time Password) is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #69773D; color: #f5f5dc; padding: 20px 40px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
        </div>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
          <strong>Important:</strong> This OTP will expire in 60 seconds. If you didn't request a password reset, please ignore this email.
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Best regards,<br>
          KU Market Team
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Password Reset OTP - KU Market",
    html,
  });
}


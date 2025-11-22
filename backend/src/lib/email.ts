import nodemailer from "nodemailer";
import { logger } from "./logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Reusable transporter instance (singleton pattern)
let emailTransporter: nodemailer.Transporter | null = null;

function getEmailTransporter(): nodemailer.Transporter | null {
  // Return existing transporter if already created
  if (emailTransporter) {
    return emailTransporter;
  }

  // Verify transporter configuration
  const smtpEmail = process.env.SMTP_EMAIL?.trim() || process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim() || process.env.SMTP_PASS?.trim();
  
  if (!smtpEmail || !smtpPassword) {
    logger.warn("SMTP credentials not configured. Email will not be sent.");
    return null;
  }
  
  // Create transporter with Gmail defaults and timeout settings
  emailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
    connectionTimeout: 10000, // 10 seconds connection timeout
    socketTimeout: 10000, // 10 seconds socket timeout
    greetingTimeout: 10000, // 10 seconds greeting timeout
    pool: true, // Use connection pooling
    maxConnections: 5, // Maximum number of connections in pool
    maxMessages: 100, // Maximum messages per connection
  });

  return emailTransporter;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    const transporter = getEmailTransporter();
    
    if (!transporter) {
      const errorMsg = "SMTP credentials not configured. Please check SMTP_USER and SMTP_PASS environment variables.";
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Verify SMTP connection before sending
    try {
      await transporter.verify();
      logger.log("SMTP connection verified successfully");
    } catch (verifyError) {
      logger.error("SMTP connection verification failed:", verifyError);
      // Reset transporter on verification failure
      if (emailTransporter) {
        emailTransporter.close();
        emailTransporter = null;
      }
      
      // Provide more specific error messages
      const errorMessage = verifyError instanceof Error ? verifyError.message : String(verifyError);
      if (errorMessage.includes("Invalid login") || errorMessage.includes("authentication")) {
        throw new Error("SMTP authentication failed. Please check your SMTP_USER and SMTP_PASS credentials.");
      } else if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
        throw new Error("SMTP connection timeout. Please check your network connection and SMTP settings.");
      } else {
        throw new Error(`SMTP connection failed: ${errorMessage}`);
      }
    }

    // Send email with timeout
    const info = await Promise.race([
      transporter.sendMail({
        from: `"KU Market" <${process.env.SMTP_EMAIL?.trim() || process.env.SMTP_USER?.trim()}>`,
        to,
        subject,
        html,
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Email sending timeout after 15 seconds")), 15000)
      ),
    ]);

    logger.log("Email sent successfully:", info.messageId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error sending email:", errorMessage);
    
    // Reset transporter on error to force recreation on next attempt
    if (emailTransporter) {
      try {
        emailTransporter.close();
      } catch {
        // Ignore close errors
      }
      emailTransporter = null;
    }
    
    // Re-throw with more context
    throw new Error(errorMessage);
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


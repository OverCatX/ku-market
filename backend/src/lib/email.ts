import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { logger } from "./logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Singleton transporter instance for connection pooling and resource efficiency
let emailTransporter: Transporter | null = null;

/**
 * Get or create SMTP transporter with connection pooling
 * Uses singleton pattern to reuse connections and reduce resource usage
 * Defaults to Gmail SMTP settings
 */
function getEmailTransporter(): Transporter | null {
  // Return existing transporter if already created
  if (emailTransporter) {
    return emailTransporter;
  }

  // Get SMTP configuration from environment
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  // Validate required configuration
  if (!smtpUser || !smtpPass) {
    logger.error("SMTP configuration incomplete. Required: SMTP_USER, SMTP_PASS");
    return null;
  }

  try {
    // Create transporter with Gmail defaults and connection pooling for better resource management
    emailTransporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail service (automatically sets host, port, secure)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Connection pooling settings to reduce resource usage
      pool: true, // Use connection pooling
      maxConnections: 5, // Maximum number of connections in pool
      maxMessages: 100, // Maximum messages per connection before closing
      // Timeout settings to prevent hanging connections
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
    } as nodemailer.TransportOptions);

    logger.log("SMTP transporter initialized successfully (Gmail)");
    return emailTransporter;
  } catch (error) {
    logger.error("Failed to create SMTP transporter:", error);
    return null;
  }
}

/**
 * Verify SMTP connection (called once on startup)
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    logger.log("SMTP connection verified successfully");
    return true;
  } catch (error) {
    logger.error("SMTP connection verification failed:", error);
    return false;
  }
}

/**
 * Send email using SMTP
 * Optimized with connection pooling and proper error handling
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const transporter = getEmailTransporter();
  
  if (!transporter) {
    const errorMsg = "SMTP not configured. Please check SMTP_USER and SMTP_PASS environment variables.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  if (!smtpUser) {
    throw new Error("SMTP_USER not configured");
  }

  const fromField = `KU Market <${smtpUser}>`;

  const mailOptions: SendMailOptions = {
    from: fromField,
    to,
    subject,
    html,
    // Optimize email size
    encoding: "utf-8",
    // Priority settings
    priority: "normal",
  };

  try {
    logger.log(`📧 Attempting to send email:`);
    logger.log(`   TO: ${to}`);
    logger.log(`   FROM: ${fromField}`);

    // Send email with timeout to prevent hanging
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Email sending timeout after 15 seconds")), 15000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);

    logger.log("Email sent successfully. Message ID:", info.messageId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide specific error messages based on error type
    if (errorMessage.includes("timeout")) {
      logger.error("Email sending timeout - SMTP server may be slow or unreachable");
      throw new Error("Email sending timeout. Please try again later.");
    } else if (errorMessage.includes("authentication") || errorMessage.includes("Invalid login")) {
      logger.error("SMTP authentication failed - check SMTP_USER and SMTP_PASS");
      throw new Error("SMTP authentication failed. Please check your email credentials.");
    } else if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ENOTFOUND")) {
      logger.error("SMTP connection failed - check network connection");
      throw new Error("Failed to connect to SMTP server. Please check your network connection.");
    } else {
      logger.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}

/**
 * Close email transporter connections (call on app shutdown)
 * Helps free up resources properly
 */
export async function closeEmailTransporter(): Promise<void> {
  if (emailTransporter) {
    try {
      emailTransporter.close();
      emailTransporter = null;
      logger.log("Email transporter closed successfully");
    } catch (error) {
      logger.error("Error closing email transporter:", error);
    }
  }
}

/**
 * Send password reset email with OTP
 */
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

/**
 * Send password reset email with token link
 */
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

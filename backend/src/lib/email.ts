import { Resend } from "resend";
import { logger } from "./logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Resend client instance (singleton pattern)
let resendClient: Resend | null = null;
let fromEmail: string | null = null;

function getResendClient(): { client: Resend; from: string } | null {
  // Return existing client if already created
  if (resendClient && fromEmail) {
    return { client: resendClient, from: fromEmail };
  }

  // Verify Resend API key
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const emailFrom = process.env.RESEND_FROM_EMAIL?.trim();
  
  logger.log("Resend configuration check:");
  logger.log(`  RESEND_API_KEY: ${resendApiKey ? `${resendApiKey.substring(0, 10)}...` : "NOT SET"}`);
  logger.log(`  RESEND_FROM_EMAIL: ${emailFrom || "NOT SET"}`);
  
  if (!resendApiKey) {
    logger.error("RESEND_API_KEY not configured. Email will not be sent.");
    return null;
  }

  if (!emailFrom) {
    logger.error("RESEND_FROM_EMAIL not configured. Email will not be sent.");
    return null;
  }
  
  // Create Resend client
  resendClient = new Resend(resendApiKey);
  fromEmail = emailFrom;

  logger.log("Resend client initialized successfully");
  return { client: resendClient, from: fromEmail };
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    const resendConfig = getResendClient();
    
    if (!resendConfig) {
      const errorMsg = "Resend API not configured. Please check RESEND_API_KEY and RESEND_FROM_EMAIL environment variables.";
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Send email using Resend API
    // Format: "Name <email@domain.com>" or just "email@domain.com"
    let fromField: string;
    if (resendConfig.from.includes("@resend.dev")) {
      // For Resend test domain, use simple format
      fromField = resendConfig.from;
    } else {
      // For custom domains, use formatted name
      fromField = `KU Market <${resendConfig.from}>`;
    }
    
    logger.log(`Attempting to send email to: ${to} from: ${fromField}`);
    
    const result = await Promise.race([
      resendConfig.client.emails.send({
        from: fromField,
        to,
        subject,
        html,
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Email sending timeout after 15 seconds")), 15000)
      ),
    ]);

    if (result.error) {
      logger.error("Resend API error:", JSON.stringify(result.error, null, 2));
      const errorDetails = result.error as { message?: string; name?: string; [key: string]: unknown };
      const errorMsg = errorDetails.message || errorDetails.name || JSON.stringify(result.error);
      
      // Check for specific error types
      if (errorMsg.toLowerCase().includes("domain") || errorMsg.toLowerCase().includes("not verified")) {
        logger.error(`Domain verification error. Current FROM email: ${resendConfig.from}`);
        logger.error("For testing, use: onboarding@resend.dev");
        logger.error("For production, verify your domain in Resend dashboard first.");
        throw new Error(`Email domain not verified. Please use 'onboarding@resend.dev' for testing or verify your domain in Resend dashboard.`);
      }
      
      throw new Error(`Resend API error: ${errorMsg}`);
    }

    logger.log("Email sent successfully via Resend. Email ID:", result.data?.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error sending email - Full error:", error);
    logger.error("Error sending email - Message:", errorMessage);
    
    // Reset client on error to force recreation on next attempt
    resendClient = null;
    fromEmail = null;
    
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

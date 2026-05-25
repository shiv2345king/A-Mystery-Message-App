import nodemailer from "nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const senderEmail = process.env.SENDER_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass || !senderEmail) {
      console.error("Missing SMTP env vars:", {
        SMTP_USER: !!smtpUser,
        SMTP_PASS: !!smtpPass,
        SENDER_EMAIL: !!senderEmail,
      });

      return {
        success: false,
        message: "SMTP credentials are missing.",
      };
    }

    const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

    await transporter.sendMail({
      from: `"Mystery Message" <${senderEmail}>`,
      to: email,
      subject: "Mystery Message Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${username}</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 6px;">${verifyCode}</h1>
          <p>This code expires in 1 hour.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (error: any) {
    console.error("Brevo email error:", {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
    });

    return {
      success: false,
      message: error?.response || error?.message || "Failed to send verification email.",
    };
  }
}
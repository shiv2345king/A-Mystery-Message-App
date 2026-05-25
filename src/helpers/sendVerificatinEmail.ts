import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";
import { ApiResponse } from "@/types/ApiResponse";

const apiInstance = new TransactionalEmailsApi();

apiInstance.setApiKey(
  0,
  process.env.BREVO_API_KEY as string
);

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
      return {
        success: false,
        message: "Brevo API credentials are missing.",
      };
    }

    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "Mystery Message",
      email: process.env.SENDER_EMAIL,
    };

    sendSmtpEmail.to = [
      {
        email,
        name: username,
      },
    ];

    sendSmtpEmail.subject = "Mystery Message Verification Code";

    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hello ${username}</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 6px;">${verifyCode}</h1>
        <p>This code expires in 1 hour.</p>
      </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (error: any) {
    console.error("Brevo API email error:", error?.response?.body || error);

    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}
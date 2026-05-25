import { ApiResponse } from "@/types/ApiResponse";

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

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Mystery Message",
          email: process.env.SENDER_EMAIL,
        },
        to: [
          {
            email,
            name: username,
          },
        ],
        subject: "Mystery Message Verification Code",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hello ${username}</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 6px;">${verifyCode}</h1>
            <p>This code expires in 1 hour.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);

      return {
        success: false,
        message: errorData?.message || "Failed to send verification email.",
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (error) {
    console.error("Email sending error:", error);

    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}
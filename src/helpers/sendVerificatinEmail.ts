import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Mystery Message Verification Code",
      html: `
        <div style="font-family:sans-serif;">
          <h2>Hello ${username}</h2>
          <p>Your verification code is:</p>
          <h1>${verifyCode}</h1>
          <p>This code expires in 1 hour.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (error) {
    console.error("Error sending email:", error);

    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}
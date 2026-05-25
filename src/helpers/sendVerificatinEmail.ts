import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) {
  try {
    // ✅ Check env variables first
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials are missing");
    }

    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Verify SMTP connection
    await transporter.verify();

    // ✅ Send email
    const info = await transporter.sendMail({
      from: `"Mystery Message" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Mystery Message Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${username},</h2>

          <p>Your verification code is:</p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              color: #2563eb;
              margin: 20px 0;
            "
          >
            ${verifyCode}
          </div>

          <p>This code expires in 1 hour.</p>

          <p style="margin-top: 30px;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);

    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}
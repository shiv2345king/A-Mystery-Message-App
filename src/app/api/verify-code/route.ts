import dbConnect from "../../../../lib/db.connect";
import { UserModel } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    // Decode and clean input
    const decodedValue = decodeURIComponent(username)?.trim();

    console.log("🔹 Raw username/email received:", username);
    console.log("🔹 Decoded:", decodedValue);

    // Try finding user by username first, then by email
    let user =
      (await UserModel.findOne({ username: decodedValue })) ||
      (await UserModel.findOne({ email: decodedValue }));

    if (!user) {
      console.log("❌ User not found in DB for:", decodedValue);
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ Found user:", user.username);

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    }

    if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Invalid verification code",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error verifying user:", error);
    return Response.json(
      {
        success: false,
        message: "Internal Server Error while verifying user",
      },
      { status: 500 }
    );
  }
}

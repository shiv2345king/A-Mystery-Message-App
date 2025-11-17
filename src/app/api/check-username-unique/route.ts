import { z } from "zod";
import dbConnect from "../../../../lib/db.connect";
import { UserModel } from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    // ✅ Validate username with Zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: "Invalid username",
          errors: usernameError,
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // ✅ Check if user exists and is verified
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      // ❌ Conflict (username already taken)
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 409 }
      );
    }

    // ✅ Success (username available)
    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}

// File: app/api/check-username/route.ts
// (NOT in the /auth folder)

import { z } from "zod";
import dbConnect from "../../../../lib/db.connect";
import { UserModel } from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  try {
    console.log("1️⃣ Starting username check...");
    
    await dbConnect();
    console.log("3️⃣ Database connected!");
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    console.log("4️⃣ Checking username:", username);

    if (!username) {
      return Response.json(
        {
          success: false,
          message: "Username is required",
        },
        { status: 400 }
      );
    }

    const queryParam = { username };
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      console.log("5️⃣ Validation failed:", usernameError);
      return Response.json(
        {
          success: false,
          message: "Invalid username format",
          errors: usernameError,
        },
        { status: 400 }
      );
    }

    const { username: validatedUsername } = result.data;
    console.log("5️⃣ Validation passed!");

    console.log("6️⃣ Querying database for username:", validatedUsername);
    const existingVerifiedUser = await UserModel.findOne({
      username: validatedUsername,
      isVerified: true,
    });
    console.log("7️⃣ Query result:", existingVerifiedUser ? "Found" : "Not found");

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ ERROR in username check:");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return Response.json(
      {
        success: false,
        message: "Error checking username",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
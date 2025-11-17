import dbConnect from "../../../../lib/db.connect";
import { UserModel } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Convert string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(_user._id);

    const result = await UserModel.aggregate([
      // Match the current user by _id
      { $match: { _id: userId } },
      
      // Unwind messages array
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
      
      // Sort by createdAt descending
      { $sort: { "messages.createdAt": -1 } },
      
      // Group back and reconstruct messages array
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
      
      // Project to return only messages
      {
        $project: {
          _id: 0,
          messages: 1,
        },
      },
    ]);

    // If user not found or no result
    if (!result || result.length === 0) {
      return Response.json(
        { success: true, messages: [] },
        { status: 200 }
      );
    }

    const messages = result[0].messages;
    
    // Filter out null values (from unwind with preserveNullAndEmptyArrays)
    const filteredMessages = messages.filter((msg: any) => msg !== null);

    return Response.json(
      { success: true, messages: filteredMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET-MESSAGES ERROR:", error);
    return Response.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
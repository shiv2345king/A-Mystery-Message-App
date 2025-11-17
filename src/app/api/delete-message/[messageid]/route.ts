import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db.connect";
import { UserModel } from "../../../../model/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ messageid: string }> }
) {
  try {
    await dbConnect();

    const { messageid } = await context.params;

    if (!messageid || !mongoose.Types.ObjectId.isValid(messageid)) {
      return NextResponse.json({ success: false, message: "Invalid message ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const _user = session?.user;

    if (!session || !_user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const result = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageid) } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Message deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

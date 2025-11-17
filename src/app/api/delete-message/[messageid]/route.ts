import dbConnect from "../../../../../lib/db.connect";
import { UserModel } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { messageId } = params;

  const updated = await UserModel.findByIdAndUpdate(
    session.user._id,
    { $pull: { messages: { _id: messageId } } },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { success: false, message: "Message delete failed" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Message deleted" },
    { status: 200 }
  );
}

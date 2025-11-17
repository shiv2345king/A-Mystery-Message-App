import dbConnect from "../../../../lib/db.connect";
import { UserModel } from "@/model/User";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { acceptMessages } = await request.json();

  const updated = await UserModel.findByIdAndUpdate(
    session.user._id,
    { isAcceptingMessages: acceptMessages },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      isAcceptingMessages: updated.isAcceptingMessages,
      message: "Message acceptance updated",
    },
    { status: 200 }
  );
}

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  // 🌍 PUBLIC CHECK for /u/[username]
  if (username) {
    const user = await UserModel.findOne({ username }).select(
      "username isAcceptingMessages"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        username: user.username,
        isAcceptingMessages: user.isAcceptingMessages,
      },
      { status: 200 }
    );
  }

  // 🔐 AUTHENTICATED USER CHECK
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const foundUser = await UserModel.findById(session.user._id);

  if (!foundUser) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      isAcceptingMessages: foundUser.isAcceptingMessages,
    },
    { status: 200 }
  );
}


import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db.connect";
import {UserModel} from "@/model/User";
import {MessageModel} from "@/model/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isAcceptingMessages: user.isAcceptingMessages ?? false,
    });
  } catch (error) {
    console.error("GET /api/send-message error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { username, content } = await req.json();

    if (!username || !content) {
      return NextResponse.json(
        { success: false, message: "Username and content required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        { success: false, message: "User is not accepting messages" },
        { status: 403 }
      );
    }

    await MessageModel.create({
      content,
      ownerId: user._id,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("POST /api/send-message error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

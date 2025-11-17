import mongoose, { Schema, Document } from "mongoose";

export interface Message {
  content: string;
  createdAt: Date;
  _id: string;
}

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
  createdAt: Date;
}

const MessageSchema = new Schema<Message>({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const MessageModel =
  mongoose.models.Message ||
  mongoose.model<Message>("Message", MessageSchema);

const UserSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyCode: { type: String, required: true },
  verifyCodeExpiry: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  isAcceptingMessages: { type: Boolean, default: true },
  messages: { type: [MessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

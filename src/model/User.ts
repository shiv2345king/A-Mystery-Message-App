import mongoose, { Schema, Document, Types } from "mongoose";

// Embedded message interface
export interface Message {
  _id?: Types.ObjectId; // optional, auto-generated
  content: string;
  createdAt: Date;
}

// User interface
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

// Message schema (embedded)
const MessageSchema = new Schema<Message>({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// User schema
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

// User model
export const UserModel =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);


import { Schema, model } from "mongoose";

export const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 6, trim: true },
  },
  {
    timestamps: true,
  },
);

export const User = model("User", userSchema);

import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model("User", userSchema);

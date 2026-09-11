import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // Connect to database
    await dbConnect();

    // Get request body
    const { name, email, password } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required",
        },
        {
          status: 400,
        },
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists",
        },
        {
          status: 409,
        },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

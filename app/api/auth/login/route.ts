import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // 1. Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    // 2. Normalize email
    const normalEmail = email.toLowerCase().trim();

    // 3. Connect to database
    await dbConnect();

    // 4. Find user
    const user = await User.findOne({
      email: normalEmail,
    });

    // 5. Use the same message for both cases
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // 6. Compare password with hashed password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // 7. Generate JWT
    const token = generateToken(user._id.toString());

    // 8. Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      {
        status: 200,
      },
    );

    // 9. Store JWT in HttpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // 10. Return response
    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}

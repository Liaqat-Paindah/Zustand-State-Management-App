import dbConnect from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/user";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  await dbConnect();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: "No token found",
        },
        {
          status: 401,
        },
      );
    }
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: "Invalid token",
        },
        {
          status: 401,
        },
      );
    }

    await dbConnect();

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        {
          user: null,
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      user: null,
      message: "An error occurred",
    });
  }
}

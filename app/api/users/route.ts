import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find();

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No users found",
          users: [],
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        users,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      {
        status: 500,
      },
    );
  }
}

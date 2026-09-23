import jwt from "jsonwebtoken";
import { cookies } from "next/headers";



export async function verifyToken(){
  try {
    const token = (await cookies()).get("token")?.value;
    const jwtSecret = process.env.JWT_SECRET!;

    if (!token || !jwtSecret) {
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string"
    ) {
      return null;
    }

    return {
      userId: decoded.userId,
    };
  } catch {
    return null;
  }
}

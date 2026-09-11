import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function generateToken(userId: string) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

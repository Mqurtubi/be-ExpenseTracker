import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.type.js";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("jwt secret missing");
}

const signJwt = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

const verifyJwt = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export { signJwt, verifyJwt };

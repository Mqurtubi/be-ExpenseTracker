import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyJwt } from "../utils/jwt.js";
import type { JwtPayload } from "../types/auth.type.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(new ApiError(401, "unauntheticated"));
  }
  try {
    const payload = verifyJwt(token);
    req.user = payload as JwtPayload;
    next();
  } catch {
    next(new ApiError(401, "Invalid token"));
  }
};

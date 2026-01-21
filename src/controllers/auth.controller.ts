import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { signJwt } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registerUser = await authService.register(req.body);
    res.status(201).json({
      message: "Register success",
      data: registerUser,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = await authService.login(req.body);
    const token = signJwt({
      sub: user.id.toString(),
      email: user.email,
    });
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({
      message: "Login success",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("access_token", { httpOnly: true, sameSite: "strict" });
  res.json({ message: "Logout success" });
};

const me = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.user);
  try {
    if (!req.user?.sub) {
      return next(new ApiError(401, "unauntheticated"));
    }
    const user = await authService.me(req.user.sub);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, me };

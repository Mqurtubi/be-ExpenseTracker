import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import type { Login, Register } from "../types/auth.type.js";
import { ApiError } from "../utils/ApiError.js";
import { signJwt } from "../utils/jwt.js";
import { email } from "zod";

export const authService = {
  async register(data: Register) {
    const existEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existEmail) throw new ApiError(400, "email has been register");
    const hashPassword = await bcrypt.hash(data.password_hash, 10);

    const createUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password_hash: hashPassword,
      },
    });

    const token = signJwt({
      sub: createUser.id.toString(),
      email: createUser.email,
    });
    return {
      user: {
        id: createUser.id.toString(),
        email: createUser.email,
        name: createUser.name,
        created_at: createUser.created_at,
      },
      token,
    };
  },
  async login(data: Login) {
    const findUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!findUser) {
      throw new ApiError(400, "email or password wrong");
    }
    const hashPassword = await bcrypt.compare(
      data.password_hash,
      findUser.password_hash,
    );
    if (!hashPassword) {
      throw new ApiError(400, "emai or password wrong");
    }
    return {
      user: {
        id: findUser.id.toString(),
        email: findUser.email,
        name: findUser.name,
        created_at: findUser.created_at,
      },
    };
  },
  async me(userId: string) {
    const id = BigInt(userId);

    const findUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
    if (!findUser) {
      throw new ApiError(404, "user not found");
    }
    return { ...findUser, id: findUser.id.toString() };
  },
};

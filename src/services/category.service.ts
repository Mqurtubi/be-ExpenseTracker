import type { CreateCategory } from "../types/category.type.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../config/prisma.js";
export const categoryService = {
  async create(userId: bigint, data: CreateCategory) {
    return await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        user_id: userId,
        is_default: false,
      },
    });
  },
};

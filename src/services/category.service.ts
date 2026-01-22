import type {
  CreateCategory,
  ListCategoryQuery,
  UpdateCategory,
} from "../types/category.type.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../config/prisma.js";
export const categoryService = {
  async create(userId: bigint, data: CreateCategory) {
    const isDefault = data.is_default === true;
    return await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        user_id: userId,
        is_default: isDefault,
      },
    });
  },
  async list(userId: bigint, query: ListCategoryQuery) {
    const { type } = query;

    return prisma.category.findMany({
      where: {
        OR: [{ is_default: true }, { user_id: userId }],
        ...(type && {
          type: {
            in: [type, "BOTH"],
          },
        }),
      },
      orderBy: {
        name: "asc",
      },
    });
  },
  async update(userId: bigint, categoryId: bigint, data: UpdateCategory) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, user_id: userId },
    });
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    if (category.is_default) {
      throw new ApiError(400, "Category default cannot be changed");
    }
    if (data.type && data.type !== category.type) {
      const used = await prisma.transaction.findFirst({
        where: { category_id: categoryId },
      });
      if (used) {
        throw new ApiError(
          400,
          "Category type cannot be changed because it is used by transaction",
        );
      }
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.color && { color: data.color }),
        ...(data.icon && { icon: data.icon }),
        ...(data.type && { type: data.type }),
      },
    });
  },
  async delete(userId: bigint, categoryId: bigint) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        user_id: userId,
      },
    });
    if (!category) {
      throw new ApiError(404, "category not found");
    }
    if (category.is_default) {
      throw new ApiError(400, "Default category cannot be deleted");
    }
    const used = await prisma.transaction.findFirst({
      where: {
        category_id: categoryId,
      },
    });
    if (used) {
      throw new ApiError(
        400,
        "Category is used by transaction and cannot be deleted",
      );
    }
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return true;
  },
};

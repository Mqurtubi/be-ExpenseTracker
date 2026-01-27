import { prisma } from "../config/prisma.js";
import type { CreateBudget } from "../types/budget.type.js";
import { ApiError } from "../utils/ApiError.js";

export const budgetService = {
  async create(userId: bigint, data: CreateBudget) {
    if (data.month < 1 || data.month > 12) {
      throw new ApiError(400, "Invalid month");
    }

    if (data.amount <= 0) {
      throw new ApiError(400, "Amount must be greater than 0");
    }

    const categoryId = BigInt(data.category_id);

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ user_id: userId }, { is_default: true }],
      },
    });
    if (!category) {
      throw new ApiError(404, "category not found");
    }

    if (!["EXPENSE", "BOTH"].includes(category.type)) {
      throw new ApiError(400, "Budget can only be set for expense category");
    }
    const exist = await prisma.budget.findFirst({
      where: {
        user_id: userId,
        category_id: categoryId,
        month: data.month,
        year: data.year,
      },
    });

    if (exist) {
      throw new ApiError(
        400,
        "Budget already exist for this category and month",
      );
    }

    return prisma.budget.create({
      data: {
        user_id: userId,
        category_id: categoryId,
        month: data.month,
        year: data.year,
        amount: data.amount,
      },
    });
  },
  async list(userId: bigint, month: number, year: number) {
    return prisma.budget.findMany({
      where: {
        user_id: userId,
        month,
        year,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        category: { name: "asc" },
      },
    });
  },
  async update(userId: bigint, budgetId: bigint, amount: number) {
    if (amount <= 0) {
      throw new ApiError(400, "Amount must be greater than 0");
    }
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        user_id: userId,
      },
    });

    if (!budget) {
      throw new ApiError(404, "budget not found");
    }

    return prisma.budget.update({
      where: { id: budgetId },
      data: { amount },
    });
  },
  async delete(userId: bigint, budgetId: bigint) {
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        user_id: userId,
      },
    });
    if (!budget) {
      throw new ApiError(404, "budget not found");
    }
    await prisma.budget.delete({
      where: { id: budgetId },
    });
  },
};

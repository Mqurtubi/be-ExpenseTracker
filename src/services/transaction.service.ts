import { date, unknown } from "zod";
import { prisma } from "../config/prisma.js";
import type { CreateTransaction, Query } from "../types/trasnsaction.type.js";
import { ApiError } from "../utils/ApiError.js";

export const transactionService = {
  async create(userId: bigint, data: CreateTransaction) {
    const category = await prisma.category.findFirst({
      where: {
        id: BigInt(data.category_id),
        OR: [{ user_id: userId }, { is_default: true }],
      },
    });
    if (!category) {
      throw new ApiError(404, "category not found");
    }
    return prisma.transaction.create({
      data: {
        user_id: userId,
        category_id: category.id,
        type: data.type,
        amount: data.amount,
        transaction_date: new Date(data.transaction_date),
        ...(data.payment_method && { payment_method: data.payment_method }),
        ...(data.note && { note: data.note }),
      },
    });
  },
  async list(userId: bigint, query: Query) {
    const { month, year, category_id, search, sort = "desc", type } = query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return prisma.transaction.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        transaction_date: {
          gte: startDate,
          lte: endDate,
        },
        ...(type && { type }),
        ...(category_id && { category_id: BigInt(category_id) }),
        ...(search && { note: { contains: search } }),
      },
      orderBy: {
        transaction_date: sort,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },
  async softDelete(userId: bigint, transactionId: bigint) {
    const tx = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        user_id: userId,
        deleted_at: null,
      },
    });
    if (!tx) {
      throw new ApiError(404, "Transaction not found");
    }
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        deleted_at: new Date(),
      },
    });
    return true;
  },
  async summary(userId: bigint, month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new ApiError(400, "Invalid month");
    }
    if (!year) {
      throw new ApiError(400, "invalid year");
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          user_id: userId,
          type: "INCOME",
          deleted_at: null,
          transaction_date: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          user_id: userId,
          type: "EXPENSE",
          deleted_at: null,
          transaction_date: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);
    const income = Number(incomeAgg._sum.amount || 0);
    const expense = Number(expenseAgg._sum.amount || 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  },
  async expenseByCategory(userId: bigint, month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new ApiError(400, "invalid month");
    }
    if (!year) {
      throw new ApiError(400, "invalid year");
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await prisma.transaction.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId,
        type: "EXPENSE",
        deleted_at: null,
        transaction_date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const categoriesIds = result.map((category) => category.category_id);

    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoriesIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(
      categories.map((c) => [c.id.toString(), c.name]),
    );

    return result.map((r) => ({
      category_id: r.category_id.toString(),
      category_name: categoryMap.get(r.category_id.toString() || "Unknown"),
      amount: Number(r._sum.amount || 0),
    }));
  },
  async recent(userId: bigint, month: number, year: number, limit = 5) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        transaction_date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        transaction_date: "desc",
      },
      take: limit,
      include: {
        category: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return transactions.map((transaction) => ({
      id: transaction.id.toString(),
      type: transaction.type,
      amount: Number(transaction.amount),
      date: transaction.transaction_date,
      note: transaction.note,
      categoty: {
        id: transaction.category.id.toString(),
        name: transaction.category.name,
      },
    }));
  },
};

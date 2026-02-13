import { date, unknown } from "zod";
import { prisma } from "../config/prisma.js";
import type { CreateTransaction, Query, UpdateTransaction } from "../types/trasnsaction.type.js";
import { ApiError } from "../utils/ApiError.js";
import { Prisma } from "../../generated/prisma/client.js";

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
    const {
      month,
      year,
      category_id,
      search,
      sort_by = "transaction_date",
      sort_dir = "desc",
      type,
    } = query;

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const sortDir: Prisma.SortOrder = sort_dir === "asc" ? "asc" : "desc";

    const orderBy: Prisma.TransactionOrderByWithRelationInput[] =
      sort_by === "amount"
        ? [{ amount: sort_dir }, { transaction_date: "desc" }]
        : [{ transaction_date: sort_dir }, { amount: "desc" }];

    return prisma.transaction.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        transaction_date: {
          gte: startDate,
          lt: endDate,
        },
        ...(type && { type }),
        ...(category_id !== undefined ? { category_id: category_id } : {}),
        ...(search && {
          OR: [
            { note: { contains: search.toLowerCase() } },
            { category: { name: { contains: search.toLowerCase() } } },
          ],
        }),
      },
      orderBy,
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
  async update(userId:bigint, transactionId:bigint,data:UpdateTransaction){
    const tx= await prisma.transaction.findFirst({
      where:{
        id:transactionId,
        user_id:userId
      }
    })
    if(!tx){
      throw new ApiError(404,"transaction not found")
    }
    return prisma.transaction.update({
      where:{
        id:transactionId
      },
      data:{
        ...(data.type&&{type:data.type}),
        ...(data.amount&&{amount:data.amount}),
        ...(data.transaction_date&&{transaction_date:new Date(data.transaction_date)}),
        ...(data.payment_method&&{payment_method:data.payment_method}),
        ...(data.category_id&&{category_id:Number(data.category_id)}),
        ...(data.note&&{note:data.note})
      }
    })
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
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
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
    const endDate = new Date(year, month, 1);
    console.log("RECENT SERVICE HIT", {
      month,
      year,
      startDate,
      endDate,
    });

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
        color: true,
      },
    });

    const categoryMap = new Map(
      categories.map((c) => [c.id.toString(), c.name]),
    );
    const categoryColorMap = new Map(
      categories.map((c) => [c.id.toString(), c.color]),
    );
    return result.map((r) => ({
      category_id: r.category_id.toString(),
      category_name: categoryMap.get(r.category_id.toString() || "Unknown"),
      category_color: categoryColorMap.get(r.category_id.toString()),
      amount: Number(r._sum.amount || 0),
    }));
  },
  async recent(userId: bigint, month: number, year: number, limit = 5) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
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
      category: {
        id: transaction.category.id.toString(),
        name: transaction.category.name,
      },
    }));
  },
};

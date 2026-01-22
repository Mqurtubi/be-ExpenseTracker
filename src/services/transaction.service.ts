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
  async softDelete(userId:bigint, transactionId:bigint){
    const tx = await prisma.transaction.findFirst({
      where:{
        id:transactionId,
        user_id:userId,
        deleted_at:null
      }
    })
    if(!tx){
      throw new ApiError(404,"Transaction not found")
    }
    await prisma.transaction.update({
      where:{id:transactionId},
      data:{
        deleted_at:new Date(),
      }
    })
    return true
  }
};

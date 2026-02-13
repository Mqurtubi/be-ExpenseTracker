import type { Request, Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service.js";
import { parseTransactionType } from "../types/parseTranasactionType.js";
import { ApiError } from "../utils/ApiError.js";

const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const tx = await transactionService.create(userId, req.body);
    return res.status(201).json({
      message: "transaction success",
      data: {
        ...tx,
        category_id: tx.category_id.toString(),
        user_id: tx.user_id.toString(),
        id: tx.id.toString(),
      },
    });
  } catch (err) {
    next(err);
  }
};

const listTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const type = parseTransactionType(req.query.type);
    const rawCategoryId =
      typeof req.query.category_id === "string"
        ? req.query.category_id
        : undefined;

    const category_id =
      rawCategoryId && !Number.isNaN(Number(rawCategoryId))
        ? Number(rawCategoryId)
        : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;
    const sort_by =
      req.query.sort_by === "amount" ? "amount" : "transaction_date";

    const sort_dir = req.query.sort_dir === "asc" ? "asc" : "desc";
    const data = await transactionService.list(userId, {
      month: Number(req.query.month),
      year: Number(req.query.year),
      type,
      category_id: category_id,
      search,
      sort_by,
      sort_dir,
    });
    return res.json({
      data: data.map((tx) => ({
        id: tx.id.toString(),
        transaction_date: tx.transaction_date,
        type: tx.type,
        amount: tx.amount,
        payment_method:tx.payment_method,
        note: tx.note,
        category: {
          id: tx.category.id.toString(),
          name: tx.category.name,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const userId = req.user.id
    const rawTransactionId = req.params.id
    if (typeof rawTransactionId !== "string") {
      throw new ApiError(400, "Invalid transaction id");
    }
    const transactionId = BigInt(rawTransactionId);
    await transactionService.update(userId, transactionId,req.body);
    return res.json({
      message: "transaction updated",
    });
  } catch (error) {
    next(error)
  }
}

const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const rawTransactionId = req.params.id;
    if (typeof rawTransactionId !== "string") {
      throw new ApiError(400, "Invalid transaction id");
    }
    const transactionId = BigInt(rawTransactionId);

    await transactionService.softDelete(userId, transactionId);
    return res.json({
      message: "transaction deleted",
    });
  } catch (error) {
    next(error);
  }
};
export { createTransaction, listTransaction, updateTransaction, deleteTransaction };

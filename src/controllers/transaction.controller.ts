import type { Request, Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service.js";
import { parseTransactionType } from "../types/parseTranasactionType.js";

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
    const category_id = parseTransactionType(req.query.category_id);
    const search = parseTransactionType(req.query.search);
    const data = await transactionService.list(userId, {
      month: Number(req.query.month),
      year: Number(req.query.year),
      type,
      category_id,
      search,
      sort: req.query.sort === "asc" ? "asc" : "desc",
    });
    return res.json({
      data: data.map((tx) => ({
        id: tx.id.toString(),
        date: tx.transaction_date,
        type: tx.type,
        amount: tx.amount,
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
export { createTransaction, listTransaction };

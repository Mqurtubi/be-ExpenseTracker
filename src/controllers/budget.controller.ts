import type { Request, Response, NextFunction } from "express";
import { budgetService } from "../services/budget.service.js";
import { ApiError } from "../utils/ApiError.js";
const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const budget = await budgetService.create(userId, req.body);

    return res.status(201).json({
      message: "Budget created",
      data: {
        id: budget.id.toString(),
        amount: budget.amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.sub;
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      throw new ApiError(400, "month and year are required");
    }

    const data = await budgetService.list(userId, month, year);
    return res.json({
      data: data.map((b) => ({
        id: b.id.toString(),
        month: b.month,
        year: b.year,
        amount: b.amount,
        categoty: {
          id: b.category.id.toString(),
          name: b.category.name,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const rawBudgetId = req.params.id;

    if (typeof rawBudgetId !== "string") {
      throw new ApiError(400, "invalid budget id");
    }

    const budgetId = BigInt(rawBudgetId);
    const { amount } = req.body;

    const budget = await budgetService.update(userId, budgetId, amount);

    return res.json({
      message: "Budget updated",
      data: {
        id: budget.id.toString(),
        amount: budget.amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const rawBudgetId = req.params.id;
    if (typeof rawBudgetId !== "string") {
      throw new ApiError(400, "invalid budget id");
    }
    const budgetId = BigInt(rawBudgetId);
    await budgetService.delete(userId, budgetId);
    return res.json({
      message: "budget deleted",
    });
  } catch (error) {
    next(error);
  }
};
const budgetSummary = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const userId = req.user.sub
    const month = Number(req.query.month)
    const year = Number(req.query.year)

    if(!month || !year){
      throw new ApiError(400,"invalid month and year")
    }

    const data = await budgetService.budgetVsActual(userId,month,year)

    return res.json({
      data
    })
  } catch (error) {
    next(error)
  }
}
export { createBudget, listBudget, updateBudget, deleteBudget, budgetSummary };

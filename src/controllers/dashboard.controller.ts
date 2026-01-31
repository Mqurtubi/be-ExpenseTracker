import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { dashboardService } from "../services/dashboard.service.js";

const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!month || !year) {
      throw new ApiError(400, "invalid month and year");
    }
    const data = await dashboardService.get(userId, month, year);
    return res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};
export { getDashboard };

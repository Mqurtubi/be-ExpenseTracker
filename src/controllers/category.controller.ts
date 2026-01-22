import type { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service.js";
const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.sub;
    const category = await categoryService.create(userId, req.body);
    return res.status(201).json({
      message: "Category created",
      data: {
        id: category.id.toString(),
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        is_default: category.is_default,
        created_at: category.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
export { createCategory };

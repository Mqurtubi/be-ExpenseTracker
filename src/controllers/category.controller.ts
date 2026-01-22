import type { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service.js";
import { ApiError } from "../utils/ApiError.js";
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

const listCategory = async (req:Request, res:Response, next:NextFunction)=>{
  try {
    const userId = req.user.sub
    const rawType = req.query.type
    const type = rawType === "INCOME" || rawType === "EXPENSE" ? rawType :undefined
    const categories = await categoryService.list(userId,{type:type})
    return res.json({
      data:categories.map((c)=>({
        id:c.id.toString(),
        name:c.name,
        type:c.type,
        icon:c.icon,
        color:c.color,
        is_default:c.is_default
      }))
    })
  } catch (error) {
    next(error)
  }
}

const deleteCategory = async (req:Request, res:Response, next:NextFunction)=>{
  try {
    const userId = req.user.sub
    const rawCategoryId= req.params.id
    if(typeof rawCategoryId !== "string"){
      throw new ApiError(400,"category id invalid")
    }
    const categoryId = BigInt(rawCategoryId)
    await categoryService.delete(userId,categoryId)
    return res.json({
      message:"success deleted"
    }) 
  } catch (error) {
    next(error) 
  }
}
export { createCategory,listCategory, deleteCategory  };

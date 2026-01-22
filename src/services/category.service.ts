import type { CreateCategory, ListCategoryQuery } from "../types/category.type.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../config/prisma.js";
export const categoryService = {
  async create(userId: bigint, data: CreateCategory) {
    return await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        user_id: userId,
        is_default: false,
      },
    });
  },
  async list(userId:bigint, query:ListCategoryQuery){
    const {type} =query
    
    return prisma.category.findMany({
      where:{
        OR:[
          {is_default:true},
          {user_id:userId}
        ],
        ...(type && {
          type:{
            in:[type,"BOTH"]
          }
        }),
      },
      orderBy:{
        name:"asc"
      }
    })
  },
  async delete(userId:bigint, categoryId:bigint){
    const category = await prisma.category.delete({
      where:{
        id:categoryId,
        user_id:userId
      }
    })
    if(!category){
      throw new ApiError(404,"category not found")
    }
    if(category.is_default){
      throw new ApiError(400,"Default category cannot be deleted")
    }
    const used = await prisma.transaction.findFirst({
      where:{
        category_id:categoryId
      }
    })
    if(used){
      throw new ApiError(400, "Category is used by transaction and cannot be deleted")
    }
    await prisma.category.delete({
      where:{id:categoryId}
    })
    return true
  }
};

import {prisma} from "../config/prisma.js"
import type { CreateTransaction } from "../types/trasnsaction.type.js"
import { ApiError } from "../utils/ApiError.js"

export const transactionService={
    async create(userId:bigint,data:CreateTransaction){
        const category = await prisma.category.findFirst({
            where:{
                id:BigInt(data.category_id),
                OR:[
                    {user_id:userId},
                    {is_default:true}
                ]
            }
        })
        if(!category){
            throw new ApiError(404,"category not found")
        }
        return prisma.transaction.create({
            data:{
                user_id:userId,
                category_id:category.id,
                type:data.type,
                amount:data.amount,
                transaction_date:new Date(data.transaction_date),
                ...(data.payment_method && {payment_method:data.payment_method}),
                ...(data.note && {note:data.note})
            }
        })
    },

}
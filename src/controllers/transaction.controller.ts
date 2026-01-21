import type { Request, Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service.js";

const createTransaction = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const userId = req.user.sub
        const tx = await transactionService.create(userId,req.body)
         return res.status(201).json({
            message:"transaction success",
            data:{
                ...tx,
                id:tx.id.toString()
            }
         })
    } catch (err){
        next(err)
    }
}
export {createTransaction}
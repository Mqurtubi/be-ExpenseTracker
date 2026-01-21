import { Router } from "express";
import { createTransaction } from "../controllers/transaction.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/",auth,createTransaction)

export default router
import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  listTransaction,
  updateTransaction,
} from "../controllers/transaction.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", auth, createTransaction);
router.get("/", auth, listTransaction);
router.put("/:id", auth, updateTransaction)
router.delete("/:id",auth,deleteTransaction)
export default router;

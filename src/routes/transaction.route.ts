import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  listTransaction,
} from "../controllers/transaction.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", auth, createTransaction);
router.get("/", auth, listTransaction);
router.delete("/:id",auth,deleteTransaction)
export default router;

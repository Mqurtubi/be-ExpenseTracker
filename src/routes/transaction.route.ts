import { Router } from "express";
import {
  createTransaction,
  listTransaction,
} from "../controllers/transaction.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", auth, createTransaction);
router.get("/", auth, listTransaction);

export default router;

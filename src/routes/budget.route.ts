import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
  budgetSummary,
  createBudget,
  deleteBudget,
  listBudget,
  updateBudget,
} from "../controllers/budget.controller.js";

const router = Router();

router.use(auth);

router.post("/", createBudget);
router.get("/", listBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);
router.get("/summary",budgetSummary)
export default router;

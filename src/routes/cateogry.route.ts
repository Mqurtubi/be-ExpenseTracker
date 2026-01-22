import { Router } from "express";
import { createCategory } from "../controllers/category.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", auth, createCategory);

export default router;

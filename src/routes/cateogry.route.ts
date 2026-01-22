import { Router } from "express";
import { createCategory, deleteCategory, listCategory } from "../controllers/category.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", auth, createCategory);
router.get("/",auth,listCategory)
router.delete("/:id",auth,deleteCategory)
export default router;
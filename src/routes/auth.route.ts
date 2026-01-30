import { Router } from "express";
import { login, logout, me, register } from "../controllers/index.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validateForm } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validateForm(registerSchema), register);
router.post("/login", validateForm(loginSchema), login);
router.post("/logout", auth, logout);
router.get("/me", auth, me);
export default router;

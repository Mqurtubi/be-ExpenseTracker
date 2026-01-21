import { Router } from "express";
import { login, logout, me, register } from "../controllers/index.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/me", auth, me);
export default router;

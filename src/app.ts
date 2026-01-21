import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger, errorHandler } from "./middlewares/index.js";
import authRouter from "./routes/auth.route.js";
import transactionRouter from "./routes/transaction.route.js"
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(logger);
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/transaction",transactionRouter);

app.use(errorHandler);

export { app };

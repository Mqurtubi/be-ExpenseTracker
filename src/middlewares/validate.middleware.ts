import type { Response, Request, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

const validateForm =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "validations error",
          errors: error.issues,
        });
      }
      next(error);
    }
  };

export { validateForm };

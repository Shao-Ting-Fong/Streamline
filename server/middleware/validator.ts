import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";

export function handleResult(req: Request, res: Response, next: NextFunction) {
  const errorFormatter = (error: ValidationError) => {
    if (error.type === "field") {
      const { path, msg } = error;
      return `[${path}]: ${msg}`;
    }
    return `Unknown error type: ${error.type}. Msg: ${error.msg}`;
  };
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: "Invalid value.", details: result.array() });
  }
  next();
}

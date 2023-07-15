import { NextFunction, Request, Response } from "express";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = "ValidationError";
  }
}

export class ExpressError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (err instanceof ExpressError) {
    res.status(err.statusCode).json({ errors: err.message });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ errors: err.message });
    return;
  }
  if (err instanceof Error) {
    res.status(500).json({ errors: err.message });
    return;
  }
  res.status(500).send("Oops, unknown error");
  return;
}

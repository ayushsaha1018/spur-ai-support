import { Request, Response, NextFunction } from "express";
import { LLMServiceError } from "../services/llm.service";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Unhandled Error:", err);

  if (err instanceof LLMServiceError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    status: "error",
    message,
  });
};

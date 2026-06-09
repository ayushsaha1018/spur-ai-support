import { Request, Response, NextFunction } from "express";
import winston from "winston";

// Configure Winston logger for structured JSON logging
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = performance.now();

  res.on("finish", () => {
    const durationMs = Math.round(performance.now() - start);

    logger.info("API Request Completed", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
    });
  });

  next();
};

import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";

export const validate =
  (schema: z.ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError<any>;
        const errorMessages = zodError.issues.map((e: ZodIssue) => e.message).join(", ");
        res.status(400).json({
          status: "error",
          message: errorMessages || "Validation failed",
          errors: zodError.issues.map((e: ZodIssue) => ({ path: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(error);
    }
  };

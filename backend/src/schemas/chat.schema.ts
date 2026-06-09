import { z } from "zod";

export const chatRequestSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid("Invalid session ID format").optional(),
    message: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
  }),
});

export const historyRequestSchema = z.object({
  query: z.object({
    sessionId: z.string().uuid("Invalid session ID"),
  }),
});

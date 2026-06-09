import { Router, Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import { chatRequestSchema, historyRequestSchema } from "../schemas/chat.schema";
import { dbService } from "../services/db.service";
import { llmService } from "../services/llm.service";
import { ModelMessage } from "ai";

const router = Router();

router.post(
  "/message",
  validate(chatRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message } = req.body;
      let { sessionId } = req.body;

      if (!sessionId) {
        const newConv = await dbService.createConversation();
        sessionId = newConv.id;
      } else {
        const conv = await dbService.getConversationById(sessionId);
        if (!conv) {
          res.status(404).json({ status: "error", message: "Session not found" });
          return;
        }
      }

      await dbService.saveMessage(sessionId, "user", message);

      const dbMessages = await dbService.getMessagesByConversationId(sessionId);
      const coreMessages: ModelMessage[] = dbMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const reply = await llmService.generateSupportReply(coreMessages);

      await dbService.saveMessage(sessionId, "ai", reply);

      res.status(200).json({ reply, sessionId });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/history",
  validate(historyRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.query as { sessionId: string };
      
      const conv = await dbService.getConversationById(sessionId);
      if (!conv) {
        res.status(404).json({ status: "error", message: "Session not found" });
        return;
      }

      const messages = await dbService.getMessagesByConversationId(sessionId);
      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

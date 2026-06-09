import { generateText, ModelMessage } from "ai";
import { groq } from "@ai-sdk/groq";
import { createFallback } from "ai-fallback";
import { SYSTEM_PROMPT } from "../prompts/systemPrompt";

export class LLMServiceError extends Error {
  constructor(message: string, public statusCode: number = 503) {
    super(message);
    this.name = "LLMServiceError";
  }
}

const fallbackModel = createFallback({
  models: [
    groq("llama-3.3-70b-versatile"),
    groq("openai/gpt-oss-120b"),
    groq("qwen/qwen3-32b"),
    groq("meta-llama/llama-4-scout-17b-16e-instruct"),
  ],
  onError: (error, modelId) => {
    console.warn(`Model ${modelId} failed, trying next fallback:`, error.message);
  },
  modelResetInterval: 60000,
});

export class LLMService {
  async generateSupportReply(messages: ModelMessage[]): Promise<string> {
    try {
      const response = await generateText({
        model: fallbackModel,
        system: SYSTEM_PROMPT,
        messages,
        maxOutputTokens: 500,
      });
      return response.text;
    } catch (error) {
      console.error("LLM Error:", error);
      throw new LLMServiceError("I'm experiencing high traffic right now. Please try again in a moment.", 503);
    }
  }
}

export const llmService = new LLMService();

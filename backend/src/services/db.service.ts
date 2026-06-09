import { db } from "../db";
import { conversations, messages } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { redis } from "../db/redis";

const CACHE_TTL_SECONDS = 3600; // 1 hour
const CACHE_PREFIX = "chat:messages:";

export class DBService {
  async createConversation() {
    const [conversation] = await db.insert(conversations).values({}).returning();
    return conversation;
  }

  async getConversationById(id: string) {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async saveMessage(conversationId: string, sender: "user" | "ai", content: string) {
    const [message] = await db
      .insert(messages)
      .values({ conversationId, sender, content })
      .returning();

    // Push to Redis cache (LPUSH so newest is at index 0)
    try {
      const cacheKey = `${CACHE_PREFIX}${conversationId}`;
      await redis.lpush(cacheKey, JSON.stringify(message));
      await redis.expire(cacheKey, CACHE_TTL_SECONDS);
    } catch {
      // Cache write failure is non-critical; Postgres is the source of truth
    }

    return message;
  }

  async getMessagesByConversationId(conversationId: string) {
    const cacheKey = `${CACHE_PREFIX}${conversationId}`;

    // Try Redis cache first
    try {
      const cached = await redis.lrange(cacheKey, 0, -1);
      if (cached.length > 0) {
        // LRANGE returns newest-first; reverse to get chronological order
        return cached.map((item) => JSON.parse(item)).reverse();
      }
    } catch {
      // Cache read failure; fall through to Postgres
    }

    // Cache miss — fetch from Postgres and populate cache
    const dbMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.timestamp));

    try {
      if (dbMessages.length > 0) {
        const cacheKey = `${CACHE_PREFIX}${conversationId}`;
        // LPUSH each message (reversed so oldest goes in first)
        const serialized = dbMessages.map((msg) => JSON.stringify(msg));
        await redis.lpush(cacheKey, ...serialized);
        await redis.expire(cacheKey, CACHE_TTL_SECONDS);
      }
    } catch {
      // Cache write failure is non-critical
    }

    return dbMessages;
  }

  async clearConversationCache(conversationId: string) {
    try {
      await redis.del(`${CACHE_PREFIX}${conversationId}`);
    } catch {
      // Non-critical
    }
  }
}

export const dbService = new DBService();

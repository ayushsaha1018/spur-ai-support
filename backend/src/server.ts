import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import { rateLimit } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redis } from "./db/redis";
import { sqlClient } from "./db";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : "*",
}));
app.use(express.json());
app.use(requestLogger);

// Set trust proxy to true if the app is behind a reverse proxy (e.g. Nginx, Heroku, AWS ELB)
// This is necessary for express-rate-limit to work correctly
app.set("trust proxy", 1);

// Configure the rate limiter with Redis-backed store
const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 50, // Limit each IP to 50 requests per `window`
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>,
  }),
  message: { status: "error", message: "Too many requests, please try again later." }
});

app.get("/api/health", async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await sqlClient`SELECT 1`;
    checks.postgres = "ok";
  } catch {
    checks.postgres = "error";
  }

  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    services: checks,
  });
});

app.use("/api/chat", chatRateLimiter, chatRoutes);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("HTTP server closed");

    try {
      await redis.quit();
      console.log("Redis connection closed");
    } catch {
      console.error("Error closing Redis");
    }

    try {
      await sqlClient.end();
      console.log("Postgres connection closed");
    } catch {
      console.error("Error closing Postgres");
    }

    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

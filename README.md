# Spur Support Agent Widget

This repository contains a full-stack, AI-powered customer support chat widget built for the Spur Founding Full-Stack Engineer take-home assignment.

> **Note on Live Deployment**: The backend is deployed on Render's free tier. If no requests are received for 15 minutes, the server will spin down. As a result, the **very first request** may take some additional time to wake the server up. Please be patient!

## 🚀 Quickstart: How to Run Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **Docker** (for running PostgreSQL and Redis)
- A **Groq API Key** (or OpenAI/Anthropic depending on your provider of choice)

### 2. Environment Variables
Copy the example environment file and add your Groq API key:
```bash
cp backend/.env.example backend/.env
```
Then edit `backend/.env` and replace `gsk_your_groq_api_key_here` with your actual Groq API key from [console.groq.com](https://console.groq.com).

### 3. Setup the Database & Cache
We use Docker to instantly spin up local Postgres and Redis instances:
```bash
docker-compose up -d
```
Once the services are running, push the Drizzle ORM schema to the database:
```bash
cd backend
npm run db:push
```

### 4. Run the Backend
```bash
cd backend
npm install
npm run dev
```
The backend will run on `http://localhost:3001`.

### 5. Run the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`. Open it in your browser to interact with the widget!

---

## 🏗 Architecture Overview

The project is structured as a monorepo containing a strictly-typed Express backend and a modern React frontend.

### Backend Structure
The backend embraces a layered, cleanly separated architecture:
- **Routes (`src/routes/`)**: Handles HTTP definitions.
- **Middleware (`src/middleware/`)**: Global error handlers and robust Zod validation wrappers.
- **Services (`src/services/`)**: The core business logic.
  - `db.service.ts`: Encapsulates all PostgreSQL/Drizzle queries with Redis caching for conversation history.
  - `llm.service.ts`: Encapsulates the Vercel AI SDK integration with a 4-model fallback chain via `ai-fallback`.
- **Schemas (`src/schemas/`)**: Zod v4 validation schemas mapping closely to our Drizzle models.
- **Redis (`src/db/redis.ts`)**: Redis client used for rate limiting and conversation history caching.

### Frontend Structure
Built with **Vite + React + TypeScript + Tailwind CSS**:
- **Custom Hooks (`useChat.ts`)**: Manages message state, auto-generated `sessionId` persistence in `localStorage`, and handles API error states.
- **UX Niceties**: Features auto-scrolling to the newest message, bouncing typing indicators, and sleek glass-like premium UI elements.

### Interesting Design Decisions
- **Vercel AI SDK**: Used Vercel AI SDK Core (`@ai-sdk/groq`). This provides a completely unified interface (`generateText`), meaning we can swap between OpenAI, Anthropic, or Groq simply by changing a single line of code, entirely avoiding vendor lock-in.
- **Zod Middleware**: All incoming requests are strictly validated using `ZodTypeAny` before ever touching the controllers.
- **Idempotent Setup**: Provided a `docker-compose.yml` to make database and cache setup one command, removing "it works on my machine" friction for evaluators.
- **Redis**: Used for two purposes: (1) shared rate limiting across instances via `rate-limit-redis`, and (2) conversation history caching to reduce Postgres read load. Cache uses a 1-hour TTL with automatic expiry.
- **Operational Readiness**: Health check endpoint (`/api/health`) pings Postgres and Redis, returning service status. Graceful shutdown handles SIGTERM/SIGINT by draining HTTP connections and closing DB/Redis cleanly — required for zero-downtime deploys on Render, Kubernetes, etc.

---

## 🧠 LLM Notes

### Provider Used
We are using **Groq** as the AI provider with a 4-model fallback chain for reliability:
1. `llama-3.3-70b-versatile` — Primary (best instruction-following, 32K output)
2. `openai/gpt-oss-120b` — 2nd fallback (500 TPS, strong capability)
3. `qwen/qwen3-32b` — 3rd fallback (400 TPS, 40K output)
4. `meta-llama/llama-4-scout-17b-16e-instruct` — Last resort (fastest, cheapest)

If the primary model hits a rate limit or fails, the system automatically falls back to the next model and resets to the primary after 60 seconds. This is handled transparently via `ai-fallback`.

### Prompting Strategy
The LLM is prompted via a structured `systemPrompt.ts` file injected into every completion cycle.
1. **Persona Injection**: "You are a helpful customer support agent for Spur..."
2. **Domain Knowledge Injection**: Specific business rules (e.g., Free shipping over $50, 30-day return policy) are explicitly provided in the system prompt.
3. **Guardrails**: Explicit instructions to *never* hallucinate policies not covered by the domain knowledge, ensuring the agent remains strictly within operational boundaries.
4. **Context Window**: The entire conversation history (mapped to `ModelMessage[]`) is fed back into the LLM on every request so it remembers prior context.

---

## ⚖️ Trade-offs & "If I Had More Time..."

If this were going to production and I had more than a weekend, I would implement:

1. **Streaming Responses**: Token-by-token display via `streamText()` and SSE. The current JSON API contract (`{ reply: string }`) requires waiting for the full response. Streaming would make the AI feel alive and reduce perceived latency from ~1s to near-instant.
2. **Conversation Metadata**: Add `title`, `topic`, `resolved`, and `rating` fields to conversations. Enables conversation search, analytics, and a feedback loop for prompt improvement.
3. **Human Escalation**: When the AI can't answer or the user requests it, offer a "Talk to a human" option. Integrate with Slack/email webhooks to notify the support team in real-time.
4. **RAG with pgvector**: Store FAQs and store policies in a vector database (pgvector) and retrieve relevant chunks by semantic similarity before prompting the LLM. Much more scalable and maintainable than hardcoded prompt knowledge.
5. **Voice Input**: Speech-to-text for hands-free support queries using the Web Speech API. Useful for accessibility and mobile users.
6. **i18n (Internationalization)**: Multi-language support for both the UI and the LLM system prompt. Would enable serving customers in their native language.
7. **Streaming Frontend**: Typewriter-style text rendering with partial message display as tokens arrive, including a visible cursor and smooth scroll.

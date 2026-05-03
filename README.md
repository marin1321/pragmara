# Pragmara

**RAG-as-a-Service for Technical Documentation**

[![CI](https://github.com/marin1321/pragmara/actions/workflows/ci.yml/badge.svg)](https://github.com/marin1321/pragmara/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Upload documentation sources — PDFs, Markdown files, or URLs — and immediately get a fully functional REST API that answers natural-language questions with precise, cited, context-aware streaming responses.

## Architecture

```
┌─────────────┐     REST/SSE     ┌─────────────────┐     SQL      ┌────────────────┐
│   Browser   │ ────────────────▶│  FastAPI (Render)│ ───────────▶│  PostgreSQL    │
│  (Next.js)  │                  │                  │             │  (Supabase)    │
└─────────────┘                  │  • Auth (JWT)    │             └────────────────┘
                                 │  • Ingestion     │     Redis    ┌────────────────┐
                                 │  • Query (SSE)   │ ───────────▶│  Upstash       │
                                 │  • Analytics     │             └────────────────┘
                                 │  • Evaluation    │     Vector   ┌────────────────┐
                                 └─────────────────┘ ───────────▶│  Qdrant Cloud  │
                                         │                        └────────────────┘
                                         │
                                 ┌───────┴───────┐
                                 │  AI Providers  │
                                 │  • Groq (LLM)  │
                                 │  • Voyage AI   │
                                 │    (Embeddings)│
                                 └───────────────┘
```

## Features

- **Hybrid RAG Search** — Vector retrieval + cross-encoder reranking for precise results
- **Streaming Responses** — Server-sent events with real-time token delivery
- **Citation Tracking** — Source, page, and section references on every answer
- **Evaluation Scores** — Faithfulness, relevance, and context precision per query
- **Multi-Format Ingestion** — PDFs, Markdown, and web URLs with intelligent chunking
- **Analytics Dashboard** — Query volume, token usage, latency, and quality trends
- **API Key Management** — Scoped keys with rate limiting per knowledge base
- **Multi-Tenant** — Isolated knowledge bases with per-KB Qdrant filtering

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker & Docker Compose (for local services)

### 1. Clone the repository

```bash
git clone https://github.com/marin1321/pragmara.git
cd pragmara
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your credentials
```

### 3. Start local services

```bash
docker-compose up -d  # PostgreSQL, Redis, Qdrant
```

### 4. Run database migrations

```bash
alembic upgrade head
```

### 5. Start the backend server

```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.local.example .env.local  # Edit with API URL
npm run dev
```

The app is now running at `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `QDRANT_URL` | Qdrant server URL | `http://localhost:6333` |
| `QDRANT_API_KEY` | Qdrant Cloud API key | — |
| `JWT_SECRET` | Secret for signing JWT tokens | `change-me-in-production` |
| `RESEND_API_KEY` | Resend API key for magic link emails | — |
| `GROQ_API_KEY` | Groq API key for LLM inference | — |
| `VOYAGE_API_KEY` | Voyage AI API key for embeddings | — |
| `DEMO_KB_ID` | Knowledge base ID for the public demo | — |
| `LANGSMITH_API_KEY` | LangSmith API key for tracing | — |
| `SENTRY_DSN` | Sentry DSN for error tracking | — |
| `APP_ENV` | Environment (`development` / `production`) | `development` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for frontend | — |

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/magic-link` | None | Request magic link email |
| GET | `/auth/verify?token=...` | None | Verify token, get JWT |
| GET | `/v1/kb` | JWT | List knowledge bases |
| POST | `/v1/kb` | JWT | Create knowledge base |
| POST | `/v1/kb/{id}/documents` | JWT | Upload document |
| POST | `/v1/kb/{id}/query` | API Key | Query (streaming SSE) |
| GET | `/v1/kb/{id}/analytics` | JWT | Usage analytics |
| POST | `/v1/demo/query` | None | Demo query (rate limited) |

Full documentation available at `/api-docs`.

## Deployment

### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect to the GitHub repository
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set all environment variables from the table above

### Frontend (Vercel)

1. Import the repository on [Vercel](https://vercel.com)
2. Set Root Directory to `frontend`
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy — automatic preview deploys on PRs

### External Services

- **Supabase** — PostgreSQL database (free tier: 500MB)
- **Upstash** — Redis for caching and rate limiting (free tier: 10K cmds/day)
- **Qdrant Cloud** — Vector database (free tier: 1GB RAM)
- **Groq** — LLM inference with `llama-3.3-70b` (free tier: 14,400 req/day)
- **Voyage AI** — Embeddings with `voyage-3-lite` (free tier: 50M tokens/month)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| AI | Groq (LLM), Voyage AI (embeddings), cross-encoder reranker |
| Database | PostgreSQL (Supabase), Redis (Upstash), Qdrant (vector) |
| Infra | Render, Vercel, Docker, GitHub Actions |
| Observability | Sentry, LangSmith |

## Seeding the Demo KB

```bash
cd backend
python scripts/seed_demo_kb.py
```

This creates a demo knowledge base with sample documentation and prints the `DEMO_KB_ID` to set in your environment.

## Contributing

1. Fork the repository
2. Create a feature branch from `main`
3. Make small, progressive commits with conventional messages
4. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built by [Oscar Marín](https://oscarmarin.dev) as a portfolio project demonstrating production-grade AI engineering.

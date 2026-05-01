# Pragmara

RAG-as-a-Service for Technical Documentation. Upload your docs, get a query API with streaming answers, citations, and evaluation scores.

## Quick Start (Local Development)

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose

### 1. Start infrastructure services

```bash
docker compose up postgres redis qdrant -d
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your API keys
alembic upgrade head
uvicorn app.main:app --reload
```

API available at `http://localhost:8000` (docs at `/docs`).

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) |
| `REDIS_URL` | Redis connection string |
| `QDRANT_URL` | Qdrant server URL |
| `QDRANT_API_KEY` | Qdrant Cloud API key |
| `JWT_SECRET` | Secret for JWT signing |
| `GROQ_API_KEY` | Groq API key for LLM inference |
| `VOYAGE_API_KEY` | Voyage AI key for embeddings |
| `RESEND_API_KEY` | Resend key for magic link emails |
| `APP_ENV` | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

## Architecture

```
[ Browser ] ──REST/SSE──▶ [ FastAPI / Render ] ──SQL──▶ [ Supabase / PostgreSQL ]
                    │                          ──Redis──▶ [ Upstash / Redis ]
                    │                          ──Qdrant─▶ [ Qdrant Cloud ]
                    │                          ──Groq───▶ [ LLM Inference ]
                    └────────────────────────────Voyage─▶ [ Embeddings ]
```

- **Backend:** Python 3.12 / FastAPI / SQLAlchemy 2.0
- **Frontend:** Next.js 14 / TypeScript / Tailwind CSS / shadcn/ui
- **AI:** Groq (llama-3.3-70b) / Voyage AI (voyage-3-lite) / LangChain
- **Infrastructure:** PostgreSQL / Redis / Qdrant / Render / Vercel

## Deployment

- **Backend:** Render (free tier web service)
- **Frontend:** Vercel (auto-deploy from GitHub)
- **Database:** Supabase (free tier PostgreSQL)
- **Cache:** Upstash (free tier Redis)
- **Vectors:** Qdrant Cloud (free tier)
- **CI/CD:** GitHub Actions (lint + build on push)

## License

MIT

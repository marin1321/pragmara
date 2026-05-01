# Pragmara

RAG-as-a-Service for Technical Documentation.

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

## Architecture

- **Backend:** Python 3.12 / FastAPI / SQLAlchemy 2.0 / Celery
- **Frontend:** Next.js 14 / TypeScript / Tailwind CSS / shadcn/ui
- **AI:** Groq (llama-3.3-70b) / Voyage AI (voyage-3-lite) / LangChain
- **Infrastructure:** PostgreSQL / Redis / Qdrant / Render / Vercel

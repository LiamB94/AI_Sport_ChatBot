# AI_Sport_ChatBot

Full-stack sports matchup app (MatchUp AI MVP).

**Tech stack**
- **Web:** React (Vite + TypeScript)
- **API:** Node.js (Express + TypeScript) + Prisma
- **Model:** FastAPI + PyTorch
- **DB:** Postgres (Docker)

---

## Prereqs
- **Node.js** (LTS)
- **Python** 3.11+
- **Docker Desktop** (Download and Ensure Docker Desktop is running on your computer)

---

## First-time setup

### 1) Install JS dependencies (project root)
```bash
npm install
```

### 2) Start Postgres
```bash
npm run dev:db
```
### 3) Create apps/api/.env (or copy from .env.example) and set:
```bash
DATABASE_URL=postgresql://app:app_password@127.0.0.1:5433/ai_sports
MODEL_URL=http://127.0.0.1:8000
PORT=4000
```
### If this is the first time:
```bash
cd apps/api
npx prisma migrate dev

cd apps/model
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

### To run locally
```bash
npm run dev
```
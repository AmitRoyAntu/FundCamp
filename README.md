# CampFund — University Crowdfunding Monorepo

CampFund is a production-ready university crowdfunding platform where students, faculty, and alumni create and support fundraising campaigns.

The project is structured as an industry-standard full-stack monorepo with independent `client` (React + Vite) and `server` (Express REST API) applications.

---

## 📁 Monorepo Structure

```
campfund/
├── client/                     # React Frontend Application
│   ├── src/                    # Components, pages, hooks, contexts, routes
│   ├── public/                 # Static assets
│   ├── package.json            # Frontend-only dependencies
│   ├── vite.config.js          # Vite build configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   ├── index.html              # Frontend entry HTML
│   ├── Dockerfile              # Multi-stage Nginx build
│   ├── .dockerignore
│   └── .env.example
├── server/                     # Express Backend Application
│   ├── config/                 # PostgreSQL pool connection & fallback
│   ├── controllers/            # Auth, Campaign, Profile controllers
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # User and Campaign models
│   ├── routes/                 # Express API routes
│   ├── database/               # Init schema and seed data
│   ├── app.js                  # Express app setup
│   ├── server.js               # Express server listener
│   ├── package.json            # Backend-only dependencies
│   ├── Dockerfile              # Express container build
│   ├── .dockerignore
│   └── .env.example
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD deployment pipeline
├── docker-compose.yml          # Container orchestration (postgres, server, client)
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

---

## ⚡ Quick Start with Docker Compose

To spin up the entire production stack (PostgreSQL + Express Backend + React Frontend):

```bash
# 1. Clone the repository
git clone https://github.com/your-username/campfund.git
cd campfund

# 2. Launch Docker Compose
docker compose up -d --build
```

Access services:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001/api`
- **Health Check**: `http://localhost:5001/api/health`

---

## 💻 Local Development

### Frontend (`client/`)

```bash
cd client
npm install
npm run dev      # Start Vite dev server on port 5173
npm run build    # Build static assets
```

### Backend (`server/`)

```bash
cd server
npm install
npm run dev      # Start Express server on port 5001
```

---

## ⚙️ Environment Variables

### `client/.env.example`
```
VITE_API_URL=http://localhost:5001/api
```

### `server/.env.example`
```
PORT=5001
DATABASE_URL=postgresql://postgres:password@postgres:5432/campfund
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Deployment Pipeline

The repository includes a GitHub Actions pipeline (`.github/workflows/deploy.yml`) that triggers on push to `main` and deploys to an Ubuntu VPS using SSH and Docker Compose.

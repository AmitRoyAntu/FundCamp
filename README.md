# FundCamp — University Crowdfunding Platform

FundCamp is a university crowdfunding platform where students, faculty, and alumni create and support fundraising campaigns.

The project is architected as a modular full-stack monorepo with independent `client` (React + Vite + Nginx), `server` (Express REST API + PostgreSQL), and a dedicated root `nginx` reverse proxy microservice.

---

## 📁 Monorepo Structure

```text
fundcamp/
├── client/                     # React Frontend Application (Internal Port 80)
│   ├── src/                    # Components, pages, hooks, contexts, routes
│   ├── public/                 # Static assets
│   ├── nginx.conf              # Internal static asset serving Nginx config
│   ├── Dockerfile              # Multi-stage build (Node 22-alpine + Nginx)
│   ├── package.json            # Frontend-only dependencies
│   ├── vite.config.js          # Vite build & local dev proxy configuration
│   ├── .env                    # Active frontend environment variables
│   └── .env.example            # Frontend environment template
├── server/                     # Express Backend API Application (Internal Port 5001)
│   ├── config/                 # PostgreSQL pool connection & fallback
│   ├── controllers/            # Auth, Campaign, Profile controllers
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # User and Campaign models
│   ├── routes/                 # Express API routes
│   ├── database/               # Init schema (1_init.sql) and seed data (2_seed.sql)
│   ├── app.js                  # Express application setup
│   ├── server.js               # Express server listener
│   ├── Dockerfile              # Express container build (Node 22-alpine)
│   ├── package.json            # Backend-only dependencies
│   ├── .env                    # Active backend environment variables
│   └── .env.example            # Backend environment template
├── nginx/                      # Root Nginx Production Reverse Proxy
│   └── nginx.conf              # Single public entrypoint (/ -> client:80, /api -> server:5001)
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI workflow (Frontend, Backend, Docker integration test)
│       └── deploy.yml          # CD deployment workflow (SSH VPS deployment)
├── docker-compose.yml          # Container orchestration (postgres, server, client, nginx)
├── .env                        # Root environment variables for Docker Compose
├── .env.example                # Root environment template
└── README.md                   # Project documentation
```

---

## 🏗️ Architecture & Security Model

```text
                       [ User Browser ]
                              │
                              ▼ Public Port (CLIENT_PORT: 5173 / 80)
                     ┌─────────────────┐
                     │  root NGINX     │ (fundcamp_nginx)
                     │  Reverse Proxy  │
                     └────────┬────────┘
                              │
             ┌────────────────┴────────────────┐
             │ Private Network                 │ Private Network
             ▼ (http://client:80)              ▼ (http://server:5001)
      ┌──────────────┐                  ┌──────────────┐
      │ client NGINX │                  │ Express API  │ (fundcamp_server)
      │ React SPA    │                  └──────┬───────┘
      └──────────────┘                         │ Private Network (postgres:5432)
       (fundcamp_client)                       ▼
                                           PostgreSQL
                                       (fundcamp_postgres)
```

### Security Isolation Highlights:
- **Single Public Entrypoint**: Only the `nginx` reverse proxy container exposes public ports (`CLIENT_PORT`: `5173` or `80`).
- **Private Internal Network**: The `server` (Express API) and `postgres` (Database) containers operate strictly within the private `fundcamp_network` bridge and are not exposed directly to the public internet.

---

## ⚡ Quick Start with Docker Compose

To spin up the complete production stack (PostgreSQL + Express Backend + React Frontend + Nginx Reverse Proxy):

```bash
# 1. Clone the repository
git clone https://github.com/your-username/fundcamp.git
cd fundcamp

# 2. Launch Docker Compose with build & wait
docker compose up -d --build --wait
```

### Accessing Services:
- **Web Application**: `http://localhost:5173`
- **Nginx Proxied API Health**: `http://localhost:5173/api/health`
- **Nginx Proxied Campaigns API**: `http://localhost:5173/api/campaigns`

---

## 💻 Local Standalone Development

### Frontend (`client/`)
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173 with /api proxying
npm run build    # Builds production static assets
```

### Backend (`server/`)
```bash
cd server
npm install
npm run dev      # Starts Express API server on http://localhost:5001
```

---

## ⚙️ Environment Configuration

Standardized variable naming convention (`type_port`) is strictly enforced across all environment templates:

### Root Orchestration (`.env.example`)
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_db_password_here
POSTGRES_DB=fundcamp
POSTGRES_PORT=5432

SERVER_PORT=5001
NODE_ENV=production
DATABASE_URL=postgresql://postgres:your_db_password_here@postgres:5432/fundcamp
JWT_SECRET=your_jwt_secret_key_here

CLIENT_PORT=5173
CLIENT_URL=http://localhost:5173
VITE_API_URL=/api
```

### Frontend (`client/.env.example`)
```ini
# Use '/api' for Docker Compose (Nginx reverse proxy)
# Use 'http://localhost:5001/api' for standalone Vite dev
VITE_API_URL=/api
```

### Backend (`server/.env.example`)
```ini
SERVER_PORT=5001
NODE_ENV=production
DATABASE_URL=postgresql://postgres:your_db_password_here@postgres:5432/fundcamp
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

---

## 🌐 Deploying to Production (Ubuntu VM / VPS)

Follow these steps to deploy FundCamp on an Ubuntu Linux server:

### Step 1: Install Docker & Docker Compose on VPS
Connect to your server via SSH and install Docker:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose plugin
sudo apt install -y docker.io docker-compose-v2

# Enable Docker to start automatically when the server boots
sudo systemctl enable --now docker

# Allow current user to run Docker commands
sudo usermod -aG docker $USER
```

### Step 2: Configure GitHub Repository Secrets
In your GitHub repo, go to **Settings > Secrets and variables > Actions** and add:

- `HOST`: Your server IP address or domain (e.g. `192.0.2.1`)
- `USERNAME`: SSH login username (e.g. `ubuntu` or `root`)
- `SSH_KEY`: Your private SSH key content
- `PORT`: SSH port (default: `22`)
- `WORK_DIR`: *(Optional)* Custom directory on VPS (default: `$HOME/FundCamp`)

### Step 3: Automated Deployment
Push any commit to the `main` branch:

```bash
git push origin main
```

GitHub Actions will connect to your server, pull the latest code, build Docker containers, and verify health automatically.

---

## 🔄 CI/CD Automation (GitHub Actions)

### Continuous Integration (`.github/workflows/ci.yml`)
Triggers on Pull Requests and pushes to `main`/`master`/`feature/*`:
1. **Frontend CI:** Installs dependencies and verifies React/Vite production build on Node 24 LTS.
2. **Backend CI:** Installs server dependencies and verifies Express syntax and imports.
3. **Docker Integration:** Boots the entire Docker stack, asserts PostgreSQL health, and verifies HTTP responses for `/api/health` and Nginx reverse proxy routes on port `5173`.

### Continuous Deployment (`.github/workflows/deploy.yml`)
Triggers automatically on pushes to `main`:
1. SSHs into target VPS server (auto-cloning `$HOME/FundCamp` if first deployment).
2. Resets code to latest `main` commit and syncs `.env` from `.env.example`.
3. Runs `docker compose down --remove-orphans` and `docker compose up -d --build --wait`.
4. Asserts health check endpoints (`curl -f http://localhost:5173/api/health` and `curl -f http://localhost:5173/api/campaigns`) through Nginx before marking deployment successful.

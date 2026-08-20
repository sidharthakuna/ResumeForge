# ResumeForge 🚀

> **A modern, full-stack, AI-powered ATS resume builder and career studio.**  
> Create, optimize, tailor, and export job-winning resumes in seconds with Google Gemini AI and pixel-perfect PDF rendering.

---

## ✨ Features

- 🧠 **AI-Powered Resume Optimization**:
  - **ATS Score Checker**: Analyze your resume against modern Applicant Tracking System algorithms.
  - **Job Tailoring**: Match and adjust your experience and projects against specific Job Descriptions (JD).
  - **Summary Studio**: Generate compelling, role-specific professional summaries.
  - **Skills Prioritization**: Intelligently categorize and rank skills for target roles.
- 🎨 **10+ Curated Professional Resume Templates**:
  - Classic, Modern, Tech ATS, Modern Split, Executive Serif, Emerald Sidebar, Navy Banner, Minimalist, and more.
- 📄 **Pixel-Perfect PDF Generation**:
  - High-fidelity server-side PDF compilation with embedded fonts (Liberation Sans) and zero layout shifting.
- 🛡️ **Enterprise-Grade Security**:
  - Stateless JWT authentication, BCrypt password hashing, automated login rate limiting, AI endpoint rate limiting, and robust HTTP security headers (CSP, XSS, Frame Options).
- ⚡ **Modern Full-Stack Architecture**:
  - **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, TanStack Query v5, Zustand, React Hook Form, Zod.
  - **Backend**: Java 21, Spring Boot 3.4.1, Spring Data JPA, PostgreSQL, Flyway Database Migrations, Google Gemini 2.5/Flash AI Integration.
  - **Storage**: Pluggable storage providers (Local disk or AWS S3 / Cloudflare R2).

---

## 🏗️ Project Architecture

```
ResumeForge/
├── backend/                  # Spring Boot 3.4.1 (Java 21) REST API
│   ├── src/main/java/        # Controllers, Services, Entities, AI & PDF Engines
│   ├── src/main/resources/   # Config (application.yaml), Flyway SQL migrations, Fonts
│   ├── Dockerfile            # Multi-stage JDK 21 container build
│   └── docker-compose.yml    # Backend + PostgreSQL container setup
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/                  # Components, Pages, Stores, Renderers, Hooks
│   ├── public/               # Static assets & SPA routing (_redirects)
│   ├── vercel.json           # Vercel SPA routing configuration
│   └── package.json          # Frontend scripts and dependencies
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** & npm
- **PostgreSQL 14+** (or Docker)
- *(Optional)* **Google Gemini API Key** (for AI features)

---

### 1. Backend Setup

```bash
cd backend

# 1. Copy environment template
cp .env.example .env

# 2. Configure your .env file:
# - DB_USERNAME & DB_PASSWORD (for PostgreSQL)
# - JWT_SECRET (e.g. generate via: openssl rand -base64 32)
# - GEMINI_API_KEY (from Google AI Studio)

# 3. Start PostgreSQL and run tests
./mvnw clean test

# 4. Start the backend server (runs on port 9090)
./mvnw spring-boot:run
```

The backend will start at `http://localhost:9090`.  
- **Health Check**: `http://localhost:9090/api/health`
- **Swagger / OpenAPI**: `http://localhost:9090/swagger-ui.html`

---

### 2. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite development server (runs on port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment

To spin up the PostgreSQL database and backend using Docker:

```bash
cd backend
docker compose up --build
```

---

## 🌐 Production Deployment Guide

### Option A: Render (Backend) + Vercel / Netlify (Frontend)

#### 1. Backend Deployment (Render Web Service)
- **Environment**: Docker or Native Java (Temurin 21)
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/app.jar` (or use the provided `backend/Dockerfile`)
- **Required Environment Variables**:
  - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<neon-or-supabase-or-render-host>:5432/<dbname>`
  - `DB_USERNAME`: `<db_user>`
  - `DB_PASSWORD`: `<db_password>`
  - `JWT_SECRET`: `$(openssl rand -base64 32)`
  - `GEMINI_API_KEY`: `<your_gemini_api_key>`
  - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`
  - `PORT`: `10000` (Render default)
  - `KEEPALIVE_ENABLED`: `true` *(optional: keeps Render free tier awake)*
  - `RENDER_EXTERNAL_URL`: `https://your-backend-app.onrender.com`

#### 2. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Required Environment Variables**:
  - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com`

---

### Option B: Railway / Fly.io (Full Stack)
- Create a PostgreSQL database instance.
- Deploy the `backend/` directory using the provided `Dockerfile`.
- Deploy the `frontend/` directory with `VITE_API_BASE_URL` pointing to the backend URL.

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/resumebuilder` |
| `DB_USERNAME` | PostgreSQL username | `resumebuilder` |
| `DB_PASSWORD` | PostgreSQL password | `password` |
| `JWT_SECRET` | 256-bit Base64 secret key for HS256 JWT | *Required* |
| `JWT_EXPIRATION_MS` | JWT expiration duration in milliseconds | `86400000` (24 hours) |
| `GEMINI_API_KEY` | Google Gemini API Key | *Required for AI* |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-3.6-flash` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:*` |
| `STORAGE_PROVIDER` | PDF storage mode (`local` or `s3`) | `local` |
| `KEEPALIVE_ENABLED` | Self-pinging scheduler to prevent idle sleep | `false` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:9090` |

---

## 🧪 Verification & Testing

- **Backend Unit & Integration Tests**:
  ```bash
  cd backend && ./mvnw clean test
  ```
- **Frontend Typecheck & Build**:
  ```bash
  cd frontend && npm run build
  ```

---

## 📄 License
This project is licensed under the MIT License. Embedded fonts are licensed under the SIL Open Font License 1.1.

# InternHub — Internship Management Platform

A full-stack internship management platform connecting **students**, **companies**, and **admins**. Students browse and apply to internships, companies post positions and review candidates, and admins oversee the system — all through a modern, responsive interface.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, react-router-dom 7 |
| **Backend** | Node.js 22, Express 5 |
| **Database** | PostgreSQL 16 via Prisma ORM |
| **Cache** | Redis 7 (rate limiting) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Validation** | Zod |
| **File Storage** | S3-compatible (multer-s3 + AWS SDK) |
| **CV Parsing** | pdf-parse, mammoth |
| **Email** | Nodemailer (SMTP) |
| **Logging** | Winston |

## Features

###  Students
- Browse internship listings with search
- Apply to internships (with cover letter)
- Track application status (pending → reviewed → accepted/rejected)
- View scheduled interviews
- Rate companies (1–5 stars) and write reviews

###  Companies
- Register and create a company profile
- Post, edit, and delete internship listings
- Review applications and update status
- Schedule interviews with applicants
- Receive email notifications for new applications

###  Admins
- View system-wide statistics
- Manage user roles and accounts
- Delete users or change roles

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for PostgreSQL/Redis)

### 1. Clone and Install

```bash
git clone <repo-url> internship-management
cd internship-management

# Install backend dependencies
cd backend
cp .env .env          # Already configured for local dev
npm install
npx prisma generate

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start PostgreSQL & Redis

**Option A — Docker (recommended):**

```bash
docker run -d --name internship-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=internship \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d --name internship-redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Option B — Native installs:** Ensure PostgreSQL is running on port 5432 with database `internship`, user `postgres`, password `postgres`, and Redis on port 6379.

### 3. Run Migrations & Seed

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start the Application

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@internship.local | admin123 |
| Company | company@test.local | admin123 |
| Student | student@test.local | admin123 |

## Project Structure

```
internship-management/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment, logger, S3 client
│   │   ├── lib/            # Prisma client singleton
│   │   ├── middleware/     # Auth, role guard, error handler
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic layer
│   │   ├── app.js          # Express app (rate limiter, Redis)
│   │   └── server.js       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema (5 models)
│   │   ├── migrations/     # Migration history
│   │   └── seed.js         # Seed data
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + JWT interceptor
│   │   ├── context/        # Auth context provider
│   │   ├── hooks/          # Custom hooks (useToast)
│   │   ├── components/
│   │   │   ├── ui/         # Button, Input, Card, Badge, Modal, etc.
│   │   │   ├── layout/     # Navbar, Layout wrapper
│   │   │   └── toast/      # Toast notification system
│   │   ├── pages/          # 11 page components
│   │   └── App.jsx         # Router + route guards
│   └── vite.config.js      # Dev proxy to backend
└── PROJECT_MAP.md
```

## API Overview

All endpoints are prefixed with `/api`. Authentication uses JWT Bearer tokens.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register as student or company |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user profile |

### Internships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/internships` | List (supports `?q=search`, paginated) |
| POST | `/internships` | Create (company/admin) |
| GET | `/internships/:id` | Detail |
| PUT | `/internships/:id` | Update (owner/admin) |
| DELETE | `/internships/:id` | Delete (owner/admin) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications` | Apply to internship (student) |
| GET | `/applications` | List (role-scoped, paginated) |
| GET | `/applications/:id` | Detail |
| PUT | `/applications/:id/status` | Update status (company/admin) |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interviews` | Schedule (company/admin) |
| GET | `/interviews` | List (role-scoped, paginated) |
| PUT | `/interviews/:id` | Reschedule |

### Companies & Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies` | List with average rating |
| GET | `/companies/:id` | Detail |
| POST | `/companies/:id/ratings` | Rate company (student) |
| GET | `/companies/:id/ratings` | List reviews |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | System counts |
| GET | `/admin/users` | List users |
| PUT | `/admin/users/:id/role` | Change user role |
| DELETE | `/admin/users/:id` | Delete user |

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Auth
JWT_SECRET=change-this-to-a-random-secret-in-production
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/internship

# Redis
REDIS_URL=redis://localhost:6379

# S3-compatible storage
S3_BUCKET=internship-cvs
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# SMTP
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@internship.local
```

## Production Considerations

- **JWT_SECRET** — Generate a strong random secret. Never use the default value.
- **Database** — Use a managed PostgreSQL service (RDS, Cloud SQL, etc.).
- **Redis** — Use Redis with authentication and TLS in production.
- **Rate Limiting** — Enabled by default (100 req/min per IP) via Redis. Adjust `max` in `src/app.js`.
- **File Storage** — Configure S3-compatible storage for CV uploads.
- **Email** — Set up a real SMTP relay (SendGrid, Mailgun, SES, etc.).
- **Frontend** — Build with `npm run build` and serve via a CDN or reverse proxy.

## License

MIT

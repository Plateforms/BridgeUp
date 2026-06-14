# Internship Management API

## TECH_STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22.22.0 |
| Backend | Express | 5.2.1 |
| Database | SQLite (via Knex) | 3.2.10 |
| Auth | JWT (jsonwebtoken + bcryptjs) | 9.0.3 / 3.0.3 |
| Validation | Zod | 4.4.3 |
| File Storage | S3-compatible (multer-s3 + @aws-sdk/client-s3) | 3.0.1 / 3.1067.0 |
| Email | Nodemailer (SMTP) | 8.0.11 |
| CV Parsing | pdf-parse + mammoth | 2.4.5 / 1.12.0 |
| Logging | Winston | 3.19.0 |
| Frontend | React | 19.2.7 |
| Build Tool | Vite | 6.4.3 |
| Routing | react-router-dom | 7.17.0 |
| HTTP Client | Axios | 1.17.0 |
| CSS | Tailwind CSS | v4 |

## SYSTEM_FLOW

```
[Student]  → Register → Login → Browse Internships → Apply (CV upload)
           → Track Applications → Attend Interview → Rate Company

[Company]  → Register → Login → Post Internships → Review Applications
           → Update Status → Schedule Interview → Email notifications

[Admin]    → Pre-seeded → Login → Manage Users (roles/delete)
           → View System Stats → Oversee all data
```

## ARCHITECTURE

```
internship-management/
├── backend/
│   ├── src/
│   │   ├── config/           # env (Zod), logger (Winston), s3 (S3Client)
│   │   ├── lib/              # Prisma client singleton
│   │   ├── middleware/        # auth (JWT verify), roles (guard), error (handler)
│   │   ├── routes/           # auth, internships, applications, interviews, companies, ratings, uploads, admin
│   │   ├── services/         # auth, internship, application, interview, email, s3
│   │   ├── app.js            # Express app assembly (with rate limiter, Redis)
│   │   └── server.js         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # 5 models: User, Internship, Application, Interview, CompanyRating
│   │   ├── migrations/       # Prisma migration history
│   │   └── seed.js           # Seed script (admin + test users + sample data)
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # Axios with JWT interceptor
│   │   ├── context/AuthContext.jsx  # Auth (login, register, logout, user state)
│   │   ├── hooks/
│   │   │   └── useToast.js         # Toast notification hook
│   │   ├── components/
│   │   │   ├── ui/                 # Button, Input, Card, Badge, Spinner, Skeleton
│   │   │   │                      # EmptyState, Pagination, Modal
│   │   │   ├── layout/            # Navbar (sticky, responsive hamburger), Layout
│   │   │   ├── toast/             # Toast, ToastContainer
│   │   │   └── ProtectedRoute.jsx  # Auth/role gate
│   │   ├── pages/                 # 11 pages (Login, Register, Dashboard, InternshipList,
│   │   │                          # InternshipDetail, InternshipCreate, ApplicationList,
│   │   │                          # InterviewList, CompanyList, CompanyProfile, AdminDashboard)
│   │   ├── App.jsx                # React Router with role-guarded routes
│   │   └── index.css              # Tailwind v4 + design tokens (Inter font, color palette)
│   └── vite.config.js             # Proxy /api → backend:3001
└── PROJECT_MAP.md
```

### Design System

| Token | Value |
|-------|-------|
| **Primary** | `#1e40af` (blue-800) — nav, primary buttons, headings |
| **Primary Light** | `#3b82f6` (blue-500) — links, hover states |
| **Primary Subtle** | `#eff6ff` (blue-50) — active nav items, section backgrounds |
| **Accent** | `#0f766e` (teal-600) — secondary CTAs, success badges |
| **Accent Light** | `#ccfbf1` (teal-100) — success toasts |
| **Font** | Inter (Google Fonts) |
| **Card radius** | `0.75rem` (xl) |
| **Button radius** | `0.5rem` (md) |
| **Container max** | `72rem` (1152px) |

### UI Components Library

| Component | Variants | States |
|-----------|----------|--------|
| Button | primary, secondary, accent, ghost, danger | loading (disabled), hover, focus-visible |
| Input | — | label, error message, placeholder |
| Card | hover (lift on hover) | — |
| Badge | pending, reviewed, accepted, rejected, scheduled, completed, cancelled, student, company, admin | — |
| Spinner | — | animated SVG |
| Skeleton | — | animate-pulse placeholder |
| EmptyState | icon, title, description, action CTA | — |
| Pagination | page, totalPages, onPageChange | disabled prev/next |
| Modal | open, onClose, title | backdrop blur + scroll lock |
| Toast | success, error, warning, info | auto-dismiss (4s), slide-up animation |
| Navbar | sticky top, responsive hamburger | mobile drawer, active link highlight |
| Layout | centered max-width container | — |

### API Endpoints

```
POST   /api/auth/register          # Student/Company registration
POST   /api/auth/login             # Returns JWT
POST   /api/auth/register-admin    # Admin-only
GET    /api/auth/me                # Current user profile

GET    /api/internships            # List (active=true by default, ?q=search)
POST   /api/internships            # Company/Admin create
GET    /api/internships/:id        # Detail
PUT    /api/internships/:id        # Owner company or admin edit
DELETE /api/internships/:id        # Owner company or admin delete

POST   /api/applications           # Student apply
GET    /api/applications           # Scoped by role (student→own, company→theirs)
GET    /api/applications/:id       # Detail
PUT    /api/applications/:id/status  # Company/Admin update status

POST   /api/interviews             # Company/Admin schedule
GET    /api/interviews             # Scoped by role
PUT    /api/interviews/:id         # Company/Admin reschedule

GET    /api/companies              # List with avg_rating
GET    /api/companies/:id          # Detail with avg_rating
POST   /api/companies/:id/ratings  # Student rate (1-5, one per company)
GET    /api/companies/:id/ratings  # List reviews

POST   /api/uploads/cv             # Student upload CV (PDF/DOCX → S3 + text extraction)

GET    /api/admin/users            # Admin list users
PUT    /api/admin/users/:id/role   # Admin change role
DELETE /api/admin/users/:id        # Admin delete user
GET    /api/admin/stats            # System counts
```

### Database Schema

**users** — id, email, password_hash, role (student|company|admin), name, company_name, created_at, updated_at
**internships** — id, company_id (FK), title, description, requirements, location, is_active, created_at, updated_at
**applications** — id, internship_id (FK), student_id (FK), status (pending|reviewed|accepted|rejected), cover_letter, cv_s3_key, extracted_text, created_at, updated_at
**interviews** — id, application_id (FK), scheduled_at, duration_minutes, meeting_link, status (scheduled|completed|cancelled), notes, created_at
**company_ratings** — id, company_id (FK), student_id (FK), rating (1-5), review, created_at, UNIQUE(company_id, student_id)

## ORPHANS & PENDING

- S3 bucket creation + credentials (dev: MinIO at localhost:9000)
- SMTP relay setup (dev: null SMTP at localhost:1025, e.g. `npx smtp-server`)
- Rate limiting (express-rate-limit) for production deployment
- Pagination for list endpoints (page/limit query params)
- Frontend: CV file upload UI (S3 upload endpoint works, but no file picker wired in frontend form)
- Frontend: Toast/notification component for user feedback

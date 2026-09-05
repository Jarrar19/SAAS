# Flowmetrics — B2B SaaS Marketing Site & Admin CMS

Flowmetrics is a team workload analytics and productivity SaaS application. It combines automated time tracking with workload balance heatmaps to give engineering leaders clear visibility into engineering effort without manual timesheets.

This repository contains the complete full-stack implementation: a custom **Express + TypeScript REST API** backend and a **Next.js 14 App Router** frontend with Tailwind CSS and TipTap rich-text editing.

---

## 1. Architecture Overview

```text
flowmetrics/
├── apps/
│   ├── api/                     # Custom Node.js/Express REST API
│   │   ├── src/
│   │   │   ├── config/          # MongoDB connection, env configs, CORS setup
│   │   │   ├── controllers/     # public, auth, adminPlans, adminPosts
│   │   │   ├── middleware/      # requireAuth, requireRole, validateBody, rateLimiters, errorHandler
│   │   │   ├── models/          # AdminUser, PricingPlan, BlogPost, Testimonial
│   │   │   ├── routes/          # publicRoutes, authRoutes, adminRoutes
│   │   │   ├── schemas/         # Zod validation schemas
│   │   │   ├── scripts/         # seedAdmin.ts, seedContent.ts
│   │   │   └── utils/           # JWT helpers, HTML sanitization
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── web/                     # Next.js 14 App Router + Tailwind CSS
│       ├── app/
│       │   ├── page.tsx         # Landing page (Hero, Features, Pricing, Testimonials, Blog, Footer)
│       │   ├── blog/[slug]/     # Server-rendered blog post detail
│       │   └── admin/           # CMS: /admin/login, /admin/plans, /admin/posts
│       ├── components/
│       │   ├── landing/         # Marketing section components
│       │   └── admin/           # AuthGuard, AdminNav, PlanForm, PostForm, FeatureListEditor, TipTapEditor
│       ├── lib/                 # Typed API client (lib/api.ts), Auth helpers (lib/auth.ts)
│       ├── package.json
│       ├── tailwind.config.js
│       └── .env.example
└── README.md                    # Setup guide, sample curl commands & architecture reference
```

---

## 2. Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **MongoDB**: Local MongoDB community server (running on `mongodb://127.0.0.1:27017`) or MongoDB Atlas cluster connection URI
- **npm**: v9 or later

---

## 3. Environment Configuration

### Backend (`apps/api/.env`)
Create `apps/api/.env` from the provided template:
```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Description | Default / Example Value |
|---|---|---|
| `PORT` | API server listen port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/flowmetrics` |
| `JWT_SECRET` | Secret key used to sign and verify admin JWTs | *Use a 64+ char random hex string in production* |
| `CORS_ORIGIN` | Allowed client origin for CORS headers | `http://localhost:3000` |
| `ADMIN_EMAIL` | Default email for seed script | `admin@flowmetrics.io` |
| `ADMIN_PASSWORD` | Default password for seed script | `AdminFlowmetrics2026!` |

> [!IMPORTANT]
> **Production Security**: For any hosted or production deployment, change `JWT_SECRET` to a strong random key and rotate the default `ADMIN_PASSWORD`.

### Frontend (`apps/web/.env.local`)
Create `apps/web/.env.local` from the template:
```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable | Description | Default / Example Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for backend API endpoints | `http://localhost:5000/api` |

---

## 4. Installation & Seeding Guide

### Step 1: Install Dependencies
```bash
# Install backend dependencies
cd flowmetrics/apps/api
npm install

# Install frontend dependencies
cd ../web
npm install
```

### Step 2: Seed the Database
Run the seed scripts from `flowmetrics/apps/api`:

```bash
cd flowmetrics/apps/api

# 1. Seed Admin Account (idempotent; bcrypt 10 salt rounds)
npx tsx src/scripts/seedAdmin.ts

# 2. Seed Content (4 pricing plans, 5 blog posts, 4 testimonials — includes explicit drafts)
npx tsx src/scripts/seedContent.ts
```

#### Default Seed Credentials (Local Development):
- **Email:** `admin@flowmetrics.io`
- **Password:** `AdminFlowmetrics2026!`
- **Role:** `admin`

### Step 3: Start the Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd flowmetrics/apps/api
npm run dev
# Starts API on http://localhost:5000
```

**Terminal 2 (Frontend Web):**
```bash
cd flowmetrics/apps/web
npm run dev
# Starts Web App on http://localhost:3000
```

Visit:
- **Public Marketing Site:** `http://localhost:3000`
- **Admin CMS Portal:** `http://localhost:3000/admin/login`

---

## 5. Copy-Pasteable Sample `curl` Commands

All commands below can be executed directly in your terminal against a running instance (`http://localhost:5000/api`).

### 5.1 Public Endpoints (Read-Only, Drafts Strictly Excluded)

#### 1. Fetch Published Pricing Plans
```bash
curl -s -X GET http://localhost:5000/api/plans
```
<details>
<summary>Expected Response (200 OK)</summary>

```json
{
  "success": true,
  "data": [
    {
      "_id": "67cb1a4b...",
      "name": "Starter",
      "price": 29,
      "billingCycle": "monthly",
      "features": [
        "Up to 10 engineers",
        "GitHub PR cycle time tracking",
        "Weekly automated digest",
        "Standard Slack notifications"
      ],
      "highlighted": false,
      "published": true,
      "order": 1
    }
  ]
}
```
</details>

#### 2. Fetch Published Blog Posts (with `?limit=`)
```bash
curl -s -X GET "http://localhost:5000/api/posts?limit=2"
```
<details>
<summary>Expected Response (200 OK)</summary>

```json
{
  "success": true,
  "data": [
    {
      "_id": "67cb1a4b...",
      "title": "5 Signs Your Team Is Overloaded (and How to Spot Them Early)",
      "slug": "5-signs-your-team-is-overloaded",
      "excerpt": "Context switching and unreviewed PR pileups are the silent killers of engineering velocity.",
      "coverImage": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      "featured": true,
      "published": true,
      "publishedAt": "2026-09-01T10:00:00.000Z"
    }
  ]
}
```
</details>

#### 3. Fetch Single Post by Slug
```bash
curl -s -X GET http://localhost:5000/api/posts/5-signs-your-team-is-overloaded
```

#### 4. Fetch Unpublished Post Slug (404 Verification)
```bash
curl -s -X GET http://localhost:5000/api/posts/internal-draft-q4-roadmap-ai-estimation
```
<details>
<summary>Expected Response (404 Not Found)</summary>

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Blog post with slug 'internal-draft-q4-roadmap-ai-estimation' not found."
  }
}
```
</details>

#### 5. Fetch Published Testimonials
```bash
curl -s -X GET http://localhost:5000/api/testimonials
```

---

### 5.2 Authentication & Rate Limiting

#### 1. Admin Login (Retrieve JWT Token)
```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowmetrics.io","password":"AdminFlowmetrics2026!"}'
```
<details>
<summary>Expected Response (200 OK)</summary>

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67cb1a4b...",
      "email": "admin@flowmetrics.io",
      "role": "admin"
    }
  }
}
```
</details>

#### 2. Failed Login (Generic 401 — Prevents User Enumeration)
```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowmetrics.io","password":"WrongPassword123!"}'
```
<details>
<summary>Expected Response (401 Unauthorized)</summary>

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password."
  }
}
```
</details>

#### 3. Rate Limit Exceeded on Login (429 Triggered after 5 failed attempts in 15 min)
```bash
# Returns HTTP 429 when max attempts exceeded
curl -i -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowmetrics.io","password":"WrongPassword!"}'
```
<details>
<summary>Expected Response (429 Too Many Requests)</summary>

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again in 15 minutes."
  }
}
```
</details>

---

### 5.3 Admin CRUD Operations (Authenticated)

> [!TIP]
> Save the token from the login response to a shell variable:
> ```bash
> TOKEN="<paste-jwt-token-here>"
> ```

#### 1. Fetch All Plans (Published & Drafts)
```bash
curl -s -X GET http://localhost:5000/api/admin/plans \
  -H "Authorization: Bearer $TOKEN"
```

#### 2. Create a New Pricing Plan
```bash
curl -s -X POST http://localhost:5000/api/admin/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Scale",
    "price": 199,
    "billingCycle": "monthly",
    "features": [
      "Unlimited squad dashboards",
      "Real-time Linear & Slack sync",
      "Dedicated Customer Success Architect"
    ],
    "highlighted": false,
    "published": true,
    "order": 4
  }'
```
<details>
<summary>Expected Response (201 Created)</summary>

```json
{
  "success": true,
  "data": {
    "_id": "67cb2e1f...",
    "name": "Enterprise Scale",
    "price": 199,
    "billingCycle": "monthly",
    "features": [
      "Unlimited squad dashboards",
      "Real-time Linear & Slack sync",
      "Dedicated Customer Success Architect"
    ],
    "highlighted": false,
    "published": true,
    "order": 4
  }
}
```
</details>

#### 3. Update Pricing Plan (Reorder Features & Toggle Highlighted)
```bash
# Replace <PLAN_ID> with the _id returned from the create response
curl -s -X PUT http://localhost:5000/api/admin/plans/<PLAN_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "highlighted": true,
    "features": [
      "Dedicated Customer Success Architect",
      "Real-time Linear & Slack sync",
      "Unlimited squad dashboards",
      "Custom SLA & SAML SSO"
    ]
  }'
```

#### 4. Delete Pricing Plan
```bash
curl -s -X DELETE http://localhost:5000/api/admin/plans/<PLAN_ID> \
  -H "Authorization: Bearer $TOKEN"
```
<details>
<summary>Expected Response (200 OK)</summary>

```json
{
  "success": true,
  "data": {
    "message": "Pricing plan deleted successfully."
  }
}
```
</details>

#### 5. Create Blog Post (with Rich Text HTML & Auto-Set `publishedAt`)
```bash
curl -s -X POST http://localhost:5000/api/admin/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Scaling Distributed Squads",
    "slug": "scaling-distributed-squads",
    "excerpt": "Architectural principles for managing workload across multiple time zones.",
    "content": "<h2>Async Visibility</h2><p>Focus blocks protect deep engineering output.</p><ul><li>Block calendar mornings</li><li>Automate progress digests</li></ul>",
    "coverImage": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "featured": true,
    "published": true
  }'
```
<details>
<summary>Expected Response (201 Created)</summary>

```json
{
  "success": true,
  "data": {
    "_id": "67cb2f4a...",
    "title": "Scaling Distributed Squads",
    "slug": "scaling-distributed-squads",
    "excerpt": "Architectural principles for managing workload across multiple time zones.",
    "content": "<h2>Async Visibility</h2><p>Focus blocks protect deep engineering output.</p><ul><li>Block calendar mornings</li><li>Automate progress digests</li></ul>",
    "coverImage": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "featured": true,
    "published": true,
    "publishedAt": "2026-09-05T04:45:00.000Z"
  }
}
```
</details>

#### 6. Delete Blog Post
```bash
curl -s -X DELETE http://localhost:5000/api/admin/posts/<POST_ID> \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5.4 Validation Boundary & Error Handling Examples

#### 1. Zod Validation Rejection (Negative Price & Empty Features)
```bash
curl -s -X POST http://localhost:5000/api/admin/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Invalid Plan","price":-20,"billingCycle":"monthly","features":[]}'
```
<details>
<summary>Expected Response (400 Bad Request)</summary>

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed on request body.",
    "details": [
      {
        "field": "price",
        "issue": "Number must be greater than or equal to 0"
      },
      {
        "field": "features",
        "issue": "Array must contain at least 1 element(s)"
      }
    ]
  }
}
```
</details>

#### 2. Duplicate Slug Collision (409 Conflict)
```bash
# Submitting an existing slug returns 409
curl -s -X POST http://localhost:5000/api/admin/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Duplicate Post",
    "slug": "5-signs-your-team-is-overloaded",
    "excerpt": "Summary...",
    "content": "<p>Content</p>",
    "coverImage": "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    "published": true
  }'
```
<details>
<summary>Expected Response (409 Conflict)</summary>

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A blog post with slug '5-signs-your-team-is-overloaded' already exists.",
    "details": [
      {
        "field": "slug",
        "issue": "Slug must be unique across all blog posts"
      }
    ]
  }
}
```
</details>

#### 3. Malformed ObjectId (Mongoose CastError -> 400 Bad Request)
```bash
curl -s -X GET http://localhost:5000/api/admin/plans/not-a-valid-object-id \
  -H "Authorization: Bearer $TOKEN"
```
<details>
<summary>Expected Response (400 Bad Request)</summary>

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid ID format: 'not-a-valid-object-id'."
  }
}
```
</details>

---

## 6. Architecture & Technical Interview Reference

Use this reference when explaining the architectural decisions live during evaluation:

### 1. Authentication Middleware Ordering
- **Order:** `requireAuth` **must** execute and complete before `requireRole("admin")`.
- **Rationale:** `requireAuth` parses the `Authorization: Bearer <token>` header, verifies the cryptographic signature against `JWT_SECRET`, checks timestamp expiry (`exp`), and hydrates `req.user`. If `requireRole` executed first, `req.user` would be undefined, risking unhandled exceptions or authorization bypasses.
- **Role Check:** `requireRole` verifies `req.user.role === "admin"`. Valid tokens belonging to unauthorized roles cleanly return `403 Forbidden` (`FORBIDDEN`), satisfying the requirement that access checks role permissions rather than mere token existence.

### 2. Timing Attack Mitigation (`DUMMY_HASH`)
- **Mechanism:** On `POST /api/auth/login`, if the submitted email does not exist in the database, the backend executes `await bcrypt.compare(password, DUMMY_HASH)`.
- **Rationale:** Bcrypt password hashing requires ~80–120ms of CPU work. Without this dummy comparison, requests with non-existent emails would return in ~5ms, while requests with valid emails would take ~100ms. An attacker could measure latency to enumerate valid admin email addresses. The static, precomputed `DUMMY_HASH` constant guarantees identical execution time regardless of email validity.

### 3. Rate Limiter Window & Max Parameters
- **`loginLimiter`:** `windowMs: 15 * 60 * 1000` (15 min), `max: 5` per IP on `/api/auth/login`.
  - *Rationale:* Blunts automated credential stuffing and brute-force dictionary attacks against the admin portal.
- **`writeLimiter`:** `windowMs: 60 * 1000` (1 min), `max: 30` per IP on `POST/PUT/DELETE /api/admin/*`.
  - *Rationale:* Auth middleware runs **before** `writeLimiter` so that unauthenticated or malformed requests are rejected with 401/403 before consuming the admin's legitimate write request quota.
- **Headers:** Configured with `standardHeaders: true` (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`) and standard JSON error bodies on `429`.

### 4. Database-Level Draft Filtering (Zero Data Leakage)
- **Rule:** Public endpoints (`/api/plans`, `/api/posts`, `/api/testimonials`) strictly include `{ published: true }` in their Mongoose queries (`.find({ published: true })`).
- **Rationale:** Filtering is performed at the MongoDB index layer, never in Node.js application memory. Draft content is physically excluded from the wire payload, eliminating any risk of drafts leaking via query string manipulation or client inspecting hidden DOM elements.

### 5. Rich Text Sanitization Pipeline (TipTap + `sanitize-html`)
- **Pipeline:** TipTap client serializes HTML -> Express controller passes content through `sanitize-html` -> stored in MongoDB -> rendered via `dangerouslySetInnerHTML` on `/blog/[slug]`.
- **Protection:** Strips `<script>`, inline event handlers (`onload`, `onerror`), and `javascript:` URIs while whitelisting safe semantic typography tags (`<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<strong>`, `<em>`, `<a>`).

### 6. Zero Cache Staleness
- **Strategy:** All public fetches on the Next.js landing page use `fetch(url, { cache: 'no-store' })` paired with `export const dynamic = 'force-dynamic'`.
- **Result:** Modifications made in the Admin CMS (e.g., updating pricing features or publishing a new post) reflect immediately on the public landing page on page refresh without requiring a redeployment or server restart.

### 7. Token Storage: `localStorage` vs. `HttpOnly` Cookies
- **Implementation:** The client stores the JWT in `localStorage` and attaches `Authorization: Bearer <token>` to administrative API requests.
- **Security Reality:** Browsers forbid client-side JavaScript (`document.cookie`) from setting the `HttpOnly` attribute. True `HttpOnly` cookies require either the backend to issue `Set-Cookie` response headers or a Next.js API Route / BFF proxy. Standard `localStorage` is used directly and transparently for the client-side Admin CMS.

---

## 7. Automated Test Suites

The codebase includes two automated verification test suites:

1. **Frontend Landing Page Regression Suite:**
   ```bash
   cd flowmetrics/apps/web
   node scripts/testFrontend.mjs
   ```
   *Asserts all 6 sections, draft exclusion on public pages, SSR slug rendering, and 404 handling (17/17 assertions).*

2. **Full End-to-End Browser Automation Suite:**
   ```bash
   cd flowmetrics/apps/web
   node scripts/testUiAutomation.mjs
   ```
   *Automates headless Chrome to test form-based login, empty feature validation banners, 3-feature reordering/deletion, auto-slug edit lock, and TipTap rich-text publishing.*

---

## 8. License

Private assessment project developed for evaluation purposes.

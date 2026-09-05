# Flowmetrics — Technical Design Document (TD)

Companion to `PRD.md`. This document specifies architecture, data models, API contract, auth, validation, and rate limiting in enough detail to implement directly.

## 1. Architecture Overview

```
flowmetrics/
├── apps/
│   ├── web/        Next.js (TypeScript) — public landing page + admin panel UI
│   └── api/         Express (TypeScript) — REST API + auth + admin operations
```

(A single monorepo with two apps, or two separate repos, both work — pick whichever Antigravity scaffolds more cleanly. Keep `web` and `api` as clearly separate concerns either way.)

- **Frontend (`web`):** Next.js App Router, TypeScript, fetches from the API via a small typed client (`lib/api.ts`). Server components for the public landing page (fetch published content at request/build time); client components for the admin panel (needs auth state, forms, mutations).
- **Backend (`api`):** Express, TypeScript, MongoDB via Mongoose. Clean layering: `routes → controllers → services → models`.
- **Database:** MongoDB Atlas, one database, collections: `pricingplans`, `blogposts`, `testimonials`, `adminusers`.

## 2. Data Models (Mongoose Schemas)

### 2.1 PricingPlan

```ts
{
  name: string;               // required
  price: number;               // required, >= 0
  billingCycle: "monthly" | "annual"; // required, enum
  features: string[];          // required, min 1 item
  highlighted: boolean;         // default false
  published: boolean;           // default false
  order: number;                // default 0 — controls display order
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 BlogPost

```ts
{
  title: string;                // required
  slug: string;                  // required, unique, kebab-case
  excerpt: string;                // required, short summary for cards
  content: string;                 // required, rich text (HTML from TipTap or markdown)
  coverImage: string;               // required, URL
  featured: boolean;                 // default false
  published: boolean;                 // default false
  publishedAt: Date | null;            // set when published transitions false -> true
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 Testimonial

```ts
{
  name: string;        // required
  role: string;         // required — role/company combined string, e.g. "Head of Engineering, Acme Co"
  photoUrl: string;      // required
  quote: string;           // required
  published: boolean;       // default true
  order: number;              // default 0
}
```

### 2.4 AdminUser

```ts
{
  email: string;         // required, unique
  passwordHash: string;   // required, bcrypt hash — never store plaintext
  role: "admin";            // enum, extensible later
  createdAt: Date;
}
```

Seed exactly one admin user via a one-off seed script (`scripts/seedAdmin.ts`) — do not build public registration.

## 3. API Contract

Base path: `/api`

### 3.1 Public (unauthenticated, read-only)

| Method | Path | Behavior |
|---|---|---|
| GET | `/plans` | Returns `PricingPlan` where `published: true`, sorted by `order`. |
| GET | `/posts` | Returns `BlogPost` where `published: true`, sorted by `featured` desc then `publishedAt` desc. Supports `?limit=` for the landing-page card count. |
| GET | `/posts/:slug` | Returns a single published post by slug, or 404 if not found/unpublished. |
| GET | `/testimonials` | Returns `Testimonial` where `published: true`, sorted by `order`. |

All public list/detail queries **must** filter on `published: true` at the database query level (not just hidden in the UI) — this is the access rule the evaluation checks first.

### 3.2 Auth

| Method | Path | Behavior |
|---|---|---|
| POST | `/auth/login` | Body: `{ email, password }`. Verifies against `AdminUser`, returns `{ token }` (JWT) on success. **Rate-limited.** Returns 401 on bad credentials — same generic message for wrong email vs. wrong password (don't leak which one was wrong). |

### 3.3 Admin (authenticated, full CRUD) — mount under `/api/admin`

| Method | Path | Behavior |
|---|---|---|
| GET | `/admin/plans` | All plans, published and unpublished. |
| POST | `/admin/plans` | Create. Validated body. **Rate-limited.** |
| PUT | `/admin/plans/:id` | Update (including replacing `features` array). Validated body. **Rate-limited.** |
| DELETE | `/admin/plans/:id` | Delete. **Rate-limited.** |
| GET | `/admin/posts` | All posts, published and unpublished. |
| POST | `/admin/posts` | Create. Validated body. **Rate-limited.** |
| PUT | `/admin/posts/:id` | Update. Validated body. **Rate-limited.** |
| DELETE | `/admin/posts/:id` | Delete. **Rate-limited.** |
| (optional) | `/admin/testimonials` | Same CRUD pattern if testimonials are made dynamic. |

### 3.4 Standard Error Shape

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "price must be a non-negative number",
    "details": [ { "field": "price", "issue": "Expected number, received string" } ]
  }
}
```

Status codes: `400` validation, `401` missing/invalid token, `403` valid token but wrong role, `404` not found, `409` conflict (e.g. duplicate slug), `429` rate limited, `500` unhandled — with a global Express error-handling middleware as the last safety net so nothing crashes the process.

## 4. Authentication & Authorization

- **Login:** `POST /auth/login` checks email + bcrypt-compared password, issues a JWT signed with a server-side secret, short-ish expiry (e.g. 2h), payload `{ sub: userId, role: "admin" }`.
- **`requireAuth` middleware:** verifies JWT signature + expiry, attaches `req.user`. Returns 401 if missing/invalid/expired.
- **`requireRole("admin")` middleware:** runs *after* `requireAuth`, checks `req.user.role === "admin"`. Returns 403 if the role doesn't match. This is the piece that satisfies "checks role, not merely a valid token" — a valid token belonging to a non-admin role must still be rejected on admin routes.
- Apply both middlewares to every route under `/api/admin/*`.
- Frontend stores the JWT (e.g. httpOnly cookie preferred over localStorage for XSS resistance) and attaches it to admin API calls.

## 5. Validation

- Use **Zod** to define one schema per resource, shared conceptually between create and update (update schema = `.partial()` of create schema, except fields that shouldn't change).
- Validate in a small middleware: `validateBody(schema)` that parses `req.body`, and on failure calls `next()` with a formatted 400 error (via the global error handler) rather than throwing raw Zod errors to the client.
- Example (`pricingPlan.schema.ts`):

```ts
export const createPricingPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  billingCycle: z.enum(["monthly", "annual"]),
  features: z.array(z.string().min(1)).min(1),
  highlighted: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
});
export const updatePricingPlanSchema = createPricingPlanSchema.partial();
```

## 6. Rate Limiting

Using `express-rate-limit`:

- **Login limiter:** stricter — e.g. 5 attempts per 15 minutes per IP, to blunt brute force.
- **Write limiter:** looser but present — e.g. 30 requests per minute per IP (or per authenticated user), applied to all `POST/PUT/DELETE` routes under `/api/admin`.
- Return `429` with the standard error shape when exceeded.

```ts
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
export const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
```

## 7. Rich Text Editor (Admin)

- Use **TipTap** in the admin post form. Store the serialized HTML output in `BlogPost.content`.
- Sanitize on the backend before saving (e.g. `sanitize-html`) so stored content can't carry a script injection, even though only the admin writes it — cheap insurance and a good talking point for Round 2.
- Render `content` on the public `/blog/[slug]` page with `dangerouslySetInnerHTML` only after that sanitization step.

## 8. Frontend Structure (Next.js)

```
apps/web/
├── app/
│   ├── page.tsx                 # landing page: Hero, Features, Pricing, Testimonials, Blog listing, Footer
│   ├── blog/[slug]/page.tsx     # individual post detail page
│   └── admin/
│       ├── login/page.tsx
│       ├── plans/page.tsx        # list + create/edit/delete
│       └── posts/page.tsx         # list + create/edit/delete (TipTap editor)
├── components/
│   ├── landing/ (Hero, Features, PricingSection, TestimonialsSection, BlogSection, Footer)
│   └── admin/ (PlanForm, PostForm, FeatureListEditor, AuthGuard)
└── lib/
    ├── api.ts       # typed fetch client
    └── auth.ts       # token storage/retrieval helpers
```

## 9. Deployment

- **Frontend:** Vercel, env var `NEXT_PUBLIC_API_URL` pointing at the deployed backend.
- **Backend:** Render (or Railway/Fly.io), env vars: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` (set to the Vercel domain).
- Enable CORS on the backend scoped to the frontend's deployed origin only.
- Verify both hosted links work end-to-end before submission — a broken link counts as not deployed.

## 10. Build Order (recommended)

1. Backend: Mongoose models → seed script → public GET routes → auth (login + middleware) → admin CRUD routes → Zod validation → rate limiting → error handler.
2. Test every route with curl/Postman/Thunder Client before touching the frontend.
3. Frontend: static landing page shell with mock data → wire to real API → admin login page → admin plans CRUD UI → admin posts CRUD UI with TipTap.
4. Deploy backend first, then frontend pointed at it.

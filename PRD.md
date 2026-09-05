# Flowmetrics — Product Requirements Document (PRD)

## 1. Product Overview

Flowmetrics is a fictional team productivity & analytics SaaS product. It helps remote and hybrid teams see where their time and effort go, combining **time tracking** with **dashboards on workload and progress**.

- **Target customers:** engineering managers and agency owners running multiple projects across distributed teams.
- **Brand personality:** modern SaaS — confident, data-driven, clean dashboard-style visuals. Blue/teal palette is typical but not mandatory.
- **Tone of content:** direct, benefit-led, metrics-oriented (the kind of copy a B2B SaaS uses to sell to a busy manager).

This PRD describes the marketing site + admin CMS being built as a job-interview submission (Full Stack track). It is a self-contained fictional product — pricing, features, and blog content are invented for the purpose of demonstrating clean data modeling, not real-world accuracy.

## 2. Goals

1. Ship a landing page that looks and reads like a real SaaS product, not a placeholder.
2. Demonstrate clean handling of **nested/repeatable data** (pricing plan feature lists, blog content).
3. Demonstrate **boolean-flag-driven conditional UI** (`highlighted` plan, `featured` post, `published` status).
4. Provide a working **admin panel** with authenticated CRUD, backed by a real API with validation and rate limiting.
5. Be understandable enough that the author can explain every architectural decision live in a follow-up interview.

## 3. Out of Scope

- Real payment processing / checkout flow.
- Real user accounts or team seats (only a single admin role is needed).
- Actual time-tracking functionality — Flowmetrics' time-tracking features are described in marketing copy only; they are not implemented as a working product.
- Multi-language / i18n support.
- Analytics/telemetry on the marketing site itself.

## 4. Users & Roles

| Role | Description | Access |
|---|---|---|
| **Visitor (public)** | Anyone browsing the marketing site | Read-only. Sees only `published` content. |
| **Admin** | The site owner managing content | Authenticated. Full CRUD on Pricing Plans and Blog Posts. |

## 5. Landing Page Requirements

Single-page marketing site with the following sections, in order:

### 5.1 Hero
- Product name, one-line value proposition, supporting sub-headline.
- Primary CTA (e.g. "Start free trial") and secondary CTA (e.g. "See how it works").
- Optional supporting visual (dashboard mockup / illustration).

### 5.2 Features
- 4–6 feature cards, each with an icon, title, and 1–2 sentence description.
- Example feature areas: time tracking, workload dashboards, project progress reporting, team utilization, integrations, reporting/exports.

### 5.3 Pricing Plans *(dynamic — the core evaluated section)*
- Fetched from the API, not hardcoded.
- 3 tiers (Starter / Team / Business — names can be renamed but keep the 3-tier shape).
- Each plan has:
  - `name`
  - `price` (numeric)
  - `billingCycle` (e.g. `monthly` / `annual`)
  - `features` — an ordered, repeatable list of feature strings
  - `highlighted` — boolean flag; the highlighted plan is visually distinguished (e.g. "Most Popular" badge, elevated card, accent border/color)
  - `published` — boolean; unpublished plans never appear on the public site

### 5.4 Testimonials
- 3–5 testimonials, each with: name, role/company, photo, quote.
- Can be static or dynamic; dynamic is a plus but not required by the grading rubric — prioritize Pricing and Blog, which *are* explicitly graded as dynamic sections.

### 5.5 Blog *(dynamic — the other core evaluated section)*
- Rendered as a "Latest from our Blog" listing **inside the landing page** (3–6 post cards) — **not** a standalone `/blog` index page.
- Only individual posts get their own route: `/blog/[slug]`.
- Each post has:
  - `title`, `slug`, `excerpt`, `content` (rich text)
  - `coverImage`
  - `featured` — boolean/priority flag; featured posts are shown first or visually distinguished in the listing
  - `published` — boolean; drafts never appear publicly
  - `publishedAt`
- Sample post topics should read like real SaaS content marketing: e.g. "5 Signs Your Team Is Overloaded (and How to Spot Them Early)", "Async vs. Sync: Finding the Right Balance for Distributed Teams", "Flowmetrics 2.0: New Workload Heatmaps and Slack Integration", "How [Agency] Cut Reporting Time by 60% with Flowmetrics".

### 5.6 Footer / CTA
- Final conversion CTA (e.g. "Start your free 14-day trial").
- Standard footer: nav links, social links, legal links (can be placeholder), copyright.

## 6. Admin/CMS Requirements

- Admin login (authenticated; JWT-based).
- **Pricing Plans:** full CRUD, including editing the nested `features` list per plan (add/remove/reorder feature lines), and toggling `highlighted` and `published`.
- **Blog Posts:** full CRUD, including a rich-text/WYSIWYG editor for `content`, and toggling `featured` and `published`.
- Admin views should distinguish published vs. draft content clearly (e.g. a status badge).

## 7. Access & Data Rules

- **Public API (unauthenticated):** read-only, `published: true` items only. Draft/unpublished items must never be returned by a public endpoint, under any query parameter.
- **Admin API (authenticated):** full CRUD, protected by middleware that checks the user's **role**, not merely that a token is present and valid.
- **Validation:** every write endpoint validates its payload and returns a clear, structured error response for invalid input (never a silent failure or an unhandled crash).
- **Rate limiting:** applied at minimum to the admin login endpoint and to all write endpoints, to guard against brute-force and spam.
- Sensible HTTP status codes (200/201/204/400/401/403/404/409/429/500) and consistent error response shape throughout.

## 8. Non-Functional Requirements

- **Language:** TypeScript across frontend and backend.
- **Frontend:** Next.js + TypeScript.
- **Backend:** Node.js custom backend (Express), not a headless CMS — chosen deliberately so the auth middleware, validation, and rate limiting are hand-written and explainable.
- **Database:** MongoDB Atlas.
- **Deployment:** Frontend → Vercel. Backend → Render. Both deployed and connected for the hosted Full Stack submission.

## 9. Success Criteria (self-check before submission)

- [ ] All 6 landing page sections present and styled coherently.
- [ ] Pricing Plans and Blog Posts are fetched dynamically from the API, not hardcoded arrays.
- [ ] `highlighted` plan and `featured` post are visually distinguishable from others.
- [ ] Unpublished plans/posts never appear via any public endpoint or on the public site.
- [ ] Admin panel can create/edit/delete plans (with nested feature list) and posts (with rich text) end to end.
- [ ] Every write endpoint rejects invalid payloads with a clear error, not a crash.
- [ ] Login and write endpoints are rate-limited.
- [ ] Author can explain, from memory, how auth, validation, and rate limiting work — this will be tested live.
- [ ] Hosted frontend and backend links both work.

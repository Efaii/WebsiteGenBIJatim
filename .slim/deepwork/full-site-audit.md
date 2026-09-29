# Full Site Audit & Diagnostic Reconciliation

## Executive Summary
Runtime evaluation confirmed that all 12 main web routes render with status 200 OK. However, severe underlying bugs exist:
1. **Broken Contract / Console Error**: `/news` page calls protected `/api/news` endpoint without JWT token, causing a 401 response and empty news list in production.
2. **ESLint Failures**: `apps/web` has 56 lint errors (including React Hooks rule violations: conditional `useState`/`useEffect` calls in `FAQ.tsx` and `Testimonials.tsx`) and 68 warnings.
3. **Security Vulnerabilities**:
   - `JWT_SECRET` fallback string in backend middleware allow token forging if env variable is absent.
   - Path traversal in news/testimonial delete controllers allows arbitrary file deletion via `../`.
   - Seed script resets admin password to `admin/password123`.

---

## Detailed Consolidated Backlog (P0 - P3)

### 🔴 P0 - CRITICAL (Security, Data Loss, Blockers)
1. **JWT Secret Fallback (`apps/api/src/middlewares/auth.middleware.ts:4`)**
   - Fallback secret `'fallback_secret_key_123'` allows unauthorized admin action forging if `.env` is unconfigured.
   - Fix: Fail-fast if `JWT_SECRET` is missing. Remove fallback string.
2. **Arbitrary File Deletion via Path Traversal (`apps/api/src/controllers/news.controller.ts:109`, `testimonial.controller.ts:77`)**
   - `path.join` on un-sanitized DB image string allows `../` path traversal deletion.
   - Fix: Sanitize path using `path.basename` before file deletion.
3. **Destructive Seed Script (`apps/api/prisma/seed.ts:85`)**
   - Seed hardcodes and overwrites admin password to `admin/password123`.
   - Fix: Load initial credentials from environment variables; prevent default password seeding in production.
4. **React Hooks Rule Violation (`apps/web/components/home/FAQ.tsx:29`, `Testimonials.tsx:27`)**
   - Early returns occur before `useState`/`useEffect` hooks, risking React execution order crashes.
   - Fix: Move all hooks to top level before conditional returns.

---

### 🟠 P1 - HIGH RISK (API Mismatch, UX Bugs, Build Errors)
1. **Public News Endpoint 401 Unauthorized (`apps/web/lib/services/news.service.ts:4` vs `apps/api/src/routes/news.route.ts:11`)**
   - `GET /api/news` is protected by `verifyToken` middleware while `/news` public page calls it without auth token.
   - Fix: Create dedicated public `/api/news` endpoint for guest users.
2. **Dual Entry Server Mismatch (`apps/api/src/server.ts` vs `src/index.ts`)**
   - `server.ts` mounts legacy dummy routes while `index.ts` is the active entry point.
   - Fix: Remove `server.ts` and consolidate route definitions into `index.ts`.
3. **Invalid HTML: Nested Interactive Elements (`apps/web/components/ProkerCard.tsx:107`)**
   - `<Button>` inside `<Link>` breaks HTML spec and dual-focus ring accessibility.
   - Fix: Replace internal `<Button>` with a styled `<span>`.
4. **Contact Form Unwired Action (`apps/web/actions/contact.ts:1`)**
   - Contact form returns mock success after `setTimeout` without persisting message to database or email.
   - Fix: Wire server action to database table or notification service.
5. **News Detail SEO Anti-Pattern (`apps/web/app/news/[slug]/page.tsx:1`)**
   - Top-level `'use client'` disables server-side rendering for metadata.
   - Fix: Remove `'use client'` from page wrapper and move interactive components to client sub-components.

---

### 🟡 P2 - MEDIUM (Performance, Responsive, Code Quality)
1. **Missing Search Debounce (`apps/web/app/news/NewsClient.tsx:96`, `DocsClient.tsx:91`)**
   - Instant state updates trigger JS array filtering on every keystroke.
   - Fix: Implement 250ms `useDebounce` hook for search inputs.
2. **Native `alert()` Usage (`apps/web/app/commissariat/[slug]/CommissariatClient.tsx:352`, `DocsClient.tsx:295`)**
   - Blocks JS thread and breaks UI visual theme.
   - Fix: Replace `alert()` with toast notifications (`sonner`).
3. **Responsive Table Column Truncation (`apps/web/app/docs/DocsClient.tsx:150`, `AwardeePage.tsx:192`)**
   - Table columns hidden on mobile without stacked card fallback.
   - Fix: Add conditional responsive mobile stacked card layout.
4. **Hardcoded `localhost:5000` URLs (`apps/web/services/*.ts`)**
   - Breaks production HTTPS and custom domain deployments.
   - Fix: Centralize API endpoint configuration via `NEXT_PUBLIC_API_URL`.

---

### 🔵 P3 - LOW (Visual Polish, Code Cleanliness)
1. **Unused Imports & ESLint Warnings (`apps/web/app/about/AboutClient.tsx:30`)**
   - 68 warnings for dead variables and unhandled promises.
   - Fix: Clean up dead code and types across `@repo/web`.
2. **Database Query Missing Indexes (`apps/api/prisma/schema.prisma:61`)**
   - `program_kerja` lacks indexes on `commissariatId` and `tanggalProker`.
   - Fix: Add `@@index([commissariatId])` and `@@index([tanggalProker])`.

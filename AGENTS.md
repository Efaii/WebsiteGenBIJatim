# AGENTS.md — GenBI Jatim

Instructions for coding agents. Prefer short diffs. Do not commit secrets.

## Stack

| Layer | Path | Stack |
|-------|------|--------|
| Web | `apps/web` | Next.js 16, React 19, Tailwind |
| API | `apps/api` | Express, Prisma, MySQL |
| Shared | `packages/*` | workspace types/utils |

Monorepo: npm workspaces + turbo. Root scripts: `npm run dev`, `build`, `lint`.

## Local prerequisites

1. **Laragon** MySQL running (port **3306**).
2. Database: `genbi_jatim` (utf8mb4).
3. Node ≥ 18.

Default Laragon URL (no password):

```env
DATABASE_URL="mysql://root:@localhost:3306/genbi_jatim"
PORT=5000
```

- API env: `apps/api/.env` (gitignored)
- Web env (optional): `apps/web/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

Never commit `.env` / `.env.local`.

## Bootstrap (cold machine)

```powershell
# from apps/api
npx prisma generate
npx prisma db push

# import proker (normalized excel already in repo)
$env:TS_NODE_TRANSPILE_ONLY='1'
npx ts-node src/scripts/import.ts ./data/excel

# optional photos (writes web public + updates foto1-6)
npx ts-node src/scripts/process_images.ts
```

Import **wipes** all `ProgramKerja` then reloads from sheet `ALL`.

Excel source of truth for DB: `apps/api/data/excel/*_Proker_Normalized*.xlsx`  
Raw Desktop `Data Program kerja` is **not** import-ready (different shape).

Photos pipeline:

- Input: `apps/api/data/images/Dokumentasi Proker`
- Output files: `apps/web/public/uploads/proker/...`
- DB paths: `/uploads/proker/{slug}/{id}/fotoN.webp` (served by **Next** public, not only API static)

API static root: `apps/api/public/uploads` (news/testimonials). Proker gallery currently lives under **web** public.

## Run dev

```powershell
# terminal 1
cd apps/api
npm run dev
# → http://localhost:5000  health: GET /health

# terminal 2
cd apps/web
npm run dev
# → http://localhost:3000
```

Or root `npm run dev` (turbo both) if workspaces wired.

Windows: prefer `py -3` if Python needed; PowerShell (no bash heredoc). Long paths: `git config core.longpaths true`.

## Architecture (proker / komisariat)

```
Excel → Prisma ProgramKerja + Commissariat
  → GET /api/commissariats
  → GET /api/commissariats/:slug
  → GET /api/commissariats/proker          # list — must register BEFORE /proker/:id
  → GET /api/commissariats/proker/:id
  → apps/web/lib/services/program.service.ts (API first, mock fallback)
  → /program  and  /program/[id]
```

Key files:

- `apps/api/prisma/schema.prisma` — `Commissariat`, `ProgramKerja`
- `apps/api/src/controllers/commissariat.controller.ts`
- `apps/api/src/routes/commissariat.route.ts`
- `apps/api/src/scripts/import.ts`, `process_images.ts`
- `apps/web/lib/services/program.service.ts`, `commissariat.service.ts`
- `apps/web/app/program/page.tsx`, `app/program/[id]/page.tsx`
- Nav: `apps/web/config/site.ts`, `footer.ts`

Other API mounts: `/api/home`, `/api/news`, `/api/faqs`, `/api/testimonials`, `/api/auth`, `/api/dashboard`.

Frontend services often default `http://localhost:5000/api`. Keep API up when testing real data; mock fallback exists for some pages when fetch fails.

## Agent workflow (mandatory)

1. **Multi-step / multi-file** → plan first (`writing-plans` / short checklist). Bootstrap env+DB before UI polish.
2. **Bug / red logs** → `systematic-debugging` before random patches.
3. **Never claim done** without fresh evidence (`verification-before-completion`):
   - API: `GET http://localhost:5000/health`
   - Proker list: `GET http://localhost:5000/api/commissariats/proker` (expect array length > 0 if DB seeded)
   - UI: `http://localhost:3000/program` and one detail page
4. Prefer **stdlib / existing deps**. No new packages unless required.
5. **Do not commit** unless user asks. No secrets in git.
6. Shortest working diff. No drive-by refactors.
7. After Prisma schema change: `npx prisma generate` then `db push` (or migrate if project switches to migrations).
8. If `@prisma/client did not initialize`: run `prisma generate`, then restart nodemon (`rs` or restart `npm run dev`).
9. `ts-node` scripts may need `$env:TS_NODE_TRANSPILE_ONLY='1'` when client types lag.

## Smoke checklist (proker feature)

| # | Check |
|---|--------|
| 1 | Laragon MySQL up |
| 2 | `apps/api/.env` has `DATABASE_URL` |
| 3 | `prisma generate` + `db push` OK |
| 4 | `programKerja` count > 0 (or re-import) |
| 5 | API `/health` 200 |
| 6 | `/api/commissariats/proker` returns data |
| 7 | `/program` shows cards with UUID ids |
| 8 | Detail `/program/{id}` + back to `/program` |

## Out of scope defaults

- Do not redesign whole site unless asked.
- Do not force-import raw Desktop Excel without format check.
- Do not delete `public/uploads` bulk.
- Production deploy / Vercel: only when asked.

## Known sharp edges

- Import deletes all proker first.
- Photo match is fuzzy (folder name vs `namaProker`); not 100% coverage.
- Some gallery paths are web-public only; Next `images.remotePatterns` allows `localhost:5000` for API-hosted uploads.
- Windows path length can break deep upload folders.
- Dual entry: prefer `apps/api/src/index.ts` (nodemon).

## Human docs

User-facing setup/history: `README.md`.  
This file is **agent-facing**; keep it factual and short. Update when ports, import paths, or architecture change.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `Efaii/WebsiteGenBIJatim`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default canonical triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context layout with root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

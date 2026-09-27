# Keep compiled artifacts out of source trees

`apps/web` carried 225 generated `.js`/`.d.ts` files sitting next to their `.ts`/`.tsx` sources. They looked harmless because TypeScript has `noEmit: true` today, but webpack (used by `next dev --webpack`) resolves `.js` before `.ts`, so the dev server ran the **stale** compiled copies instead of the current source. Three public pages (`/commissariat/[slug]`, `/program`, `/contact`) rendered an error boundary for that reason alone, and a fourth (`/commissariat`) crashed on stale image-loader code.

## Considered Options

- **Configure webpack to resolve `.ts` before `.js`.** Rejected: it hides the artifacts instead of removing them, and it silently changes resolution for any genuinely hand-written `.js` file.
- **Leave them and rely on `git status` discipline.** Rejected: they were untracked, so nothing in CI or review would ever flag them; the failure mode is invisible until a page breaks.
- **Delete the artifacts and ignore the patterns (chosen).** Remove any `.js`/`.js.map`/`.d.ts`/`.d.ts.map` that sits beside a `.ts`/`.tsx` sibling, and add ignore rules for `apps/web` (Fase 0 extends the same treatment to `apps/api` and `packages/types`).

## Consequences

Generated output must never live beside its source in this repo. Build output belongs in `dist/` (API) or `.next/` (web), both already ignored or intentionally tracked. If a future tool needs to emit beside sources, it must be reconfigured rather than tolerated.

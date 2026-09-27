# One Button primitive: `components/Button.tsx`

The repo has exactly one button primitive in active use: `components/Button.tsx` (framer-motion based, variants `primary`/`secondary`/`outline`, sizes `sm`/`lg`). It is imported across the public pages and the contact form.

`Agent/task-007-ux-accessibility-seo-plan.md` (now archived) planned to canonicalise onto a shadcn `components/ui/button.tsx` instead. That file turned out to have **zero importers**, was deleted as dead code during the Playwright audit, and the plan is superseded by `docs/specs/public-web-hardening.md`.

## Considered Options

- **Migrate to shadcn/ui button (the old task-007 plan).** Rejected: it adds a dependency and a component library the project does not otherwise use, rewrites every call site for no functional gain, and the "two primitives" problem it was solving was actually a dead file, not a competing implementation.
- **Keep both primitives and document the split.** Rejected: two buttons with overlapping variant names is exactly the confusion task-007 wanted to remove.
- **One primitive, `components/Button.tsx` (chosen).** The unused file is gone; any future button work extends the existing primitive instead of introducing a second one.

## Consequences

`components/ui/*` no longer exists. A future design-system decision (shadcn, Radix Themes, or something else) must be made explicitly, as its own ADR, before any second button primitive is introduced.

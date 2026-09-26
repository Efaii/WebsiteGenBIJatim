# Source public periods from a curated list, not empty database rows

Public pages need a period selector (the Profil hover menu and list filters) that shows `2026/2027` before any data exists for it. We keep one curated list of period labels in the app and treat the database as the source of the data *within* a period, instead of inserting empty `Period` rows so a label appears.

## Considered Options

- **Insert empty `Period` rows for future periods.** Rejected: the clean initial-production source is verified against exact counts; adding empty period rows changes that verified shape for a purely presentational concern.
- **Show only periods that already have data.** Rejected: the operator wants `2026/2027` visible now as a forward-looking option.
- **Curated list (chosen).** One list drives the navbar and the filters; pages render an empty state when a period has no data.

## Consequences

A period label can exist in the UI without a database row, so code must not assume a `Period` row exists for every label. When a real `2026/2027` import happens, the curated list must be updated to match the imported label.

New public endpoints for this work live under `/api/v1/...` with the canonical response envelope; existing legacy public paths keep working.

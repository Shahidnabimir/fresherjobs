<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Job data flows through `getJobs` in `src/lib/jobs/jobs.functions.ts`; providers live in `providers.server.ts` and map into the shared `Job` type — so live APIs can be swapped without touching UI.
- Every job source must pass `applyFresherFilter` before reaching the UI — the fresher-only rule is the product's core promise.
- Tracker, profile and theme persist in browser localStorage via `src/lib/app-state.tsx` (no accounts yet); pure state transitions live in `src/lib/tracker.ts` so they stay testable.
- Relative dates and posted-date filtering use the server's `fetchedAt` as "now" so SSR and client render identically.
- JSearch calls use `/search-v2` with cursor pagination, a small page cap and an edge cache, because every page costs a request from the free monthly quota.
- Auth session state comes from the single `AuthProvider` in `src/lib/auth.tsx` (one `onAuthStateChange` listener); the job feed stays public and `/auth` is the only sign-in route — so there is one source of truth for "signed in".

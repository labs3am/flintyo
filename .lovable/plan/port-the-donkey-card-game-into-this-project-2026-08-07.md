# Port the Donkey card game into this project

Replace the current Flintyo "rebuilding" page with the full Donkey (Bhabhi) card game from the other project: same layout, pages, visual style, and game logic.

## What the ported app contains

- **Home (`/`)** — landing page: create a room, join by code, pass-and-play, or play vs AI bots.
- **Play (`/play`)** — local/solo setup: pick characters, bot difficulty, start a game.
- **Room (`/room/:code`)** — multiplayer lobby + live game table, synced in realtime via a shared room record.
- **Game surface** — card table, player seats, playing cards, character avatars, character picker, reaction pings, in-room chat, scoreboard, and the "Donkey reveal" end-of-round moment.
- **Game logic** — the Bhabhi rules engine, AI bot decisions, mood/reaction logic, and cross-round scoring, copied as-is.
- **Look and feel** — royal purple table, candy-gold buttons, Bricolage Grotesque + Plus Jakarta Sans typography, felt table and card textures.

## Technical notes

The two projects use different stacks, so files are ported rather than copied verbatim:

- **Routing**: source uses TanStack Start file routes (`__root.tsx`, `index.tsx`, `play.tsx`, `room.$code.tsx`). These become React Router pages (`src/pages/Index.tsx`, `Play.tsx`, `Room.tsx`, plus a `NotFound`) wired in `src/App.tsx` with `BrowserRouter`, `QueryClientProvider`, and Sonner `Toaster`. Head metadata moves into `index.html`. SSR-only files (`server.ts`, `start.ts`, `client.server.ts`, auth middleware/attacher, `routeTree.gen.ts`) are not ported.
- **Styling**: source is Tailwind v4 (`@theme inline`, oklch tokens in `styles.css`). This project is Tailwind v3, so the tokens are translated into `src/index.css` CSS variables plus `tailwind.config.ts` extensions (colors incl. gold/plate-1..5, display/sans fonts, gradients, shadows), keeping all custom utilities (`felt`, `card-face`, `card-back`, `plate`, `btn-primary`, `text-gradient`, `glow`, `panel`, animations). Fonts switch to the Bricolage Grotesque + Plus Jakarta Sans Google Fonts import.
- **React 19 → 18**: game components are reviewed for React 19-only APIs; none are expected, but any are rewritten for 18.
- **Backend**: this project's Cloud backend still holds the old Flintyo tables. A migration drops the leftover Flintyo tables/functions/views and creates the game's `rooms` table (code, JSONB state, updated_at trigger) with the same open anon/authenticated grants, RLS policies, `REPLICA IDENTITY FULL`, and realtime publication. `src/integrations/supabase/types.ts` is regenerated accordingly.
- **Cleanup**: `src/pages/Rebuilding.tsx`, `src/App.css`, and unused Flintyo helpers (`useAuth`, `countries`) are removed. Missing shadcn/ui pieces used by the game are added; existing ones are reused.
- **SEO**: `index.html` title/description/OG/Twitter tags set to the Donkey game copy, single H1 on the landing page.

## Note

The game rooms are fully open (anyone with the code can read/write room state) — matching the source project. That is fine for a casual party game; call it out if you want it locked down later.

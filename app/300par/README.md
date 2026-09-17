# 300 Par

Fan-made draft-and-simulate game, inspired by [500-0.com](https://500-0.com). Pick an IPL
franchise, draft its 11-player XI from across its history (one random season offered per
turn), then simulate a 20-over chase. No IPL team has ever scored 300 in a T20 innings —
hitting it here is meant to be rare (roughly a 1-in-5 shot with a genuinely elite historical
draft, near-zero with a weak one).

Fully client-side. No Firestore/backend involved — game state lives in React state during
a run, and only a lightweight history/best-score gets written to `localStorage`.

Currently playable: **SRH** (2013-2026), **RCB** (2008-2026), **CSK** (2008-2015 and
2018-2026 — banned for 2016-2017 over the spot-fixing scandal, so those two years are
deliberately absent, not a data gap), **MI** (2008-2026, no gaps). Adding a team is a data
task, not a code task — see "Adding a new team" below.

## File map

| File | Role |
|---|---|
| `data/teams/index.js` | Team registry — `{ code, name, founded, lastYear }`. Add a team here once its JSON exists |
| `data/teams/SRH.json`, `data/teams/RCB.json`, `data/teams/CSK.json`, `data/teams/MI.json` | Static per-team datasets: real per-season players with ratings and slot eligibility |
| `scripts/gen-srh-squads.mjs`, `scripts/gen-rcb-squads.mjs`, `scripts/gen-csk-squads.mjs`, `scripts/gen-mi-squads.mjs` | **Source of truth for the datasets.** Turn raw researched stats into `data/teams/<CODE>.json` |
| `lib/game/ratingFormula.mjs` | Shared BAT/POW/BWL formula used by every `gen-*-squads.mjs` script — one place to change the scale for all teams |
| `lib/data/seasonSquads.js` | Loader: `getTeams()`, `getSeasonSquads(teamCode)`, `getSquadForYear(teamCode, year)` |
| `lib/game/positions.js` | Batting-order slot labels (1-11) + slot-eligibility helpers |
| `lib/game/simulate.js` | Pure function `simulateChase(battingOrder)` — the ball-by-ball chase sim |
| `lib/game/localHistory.js` | `localStorage` helpers: run history, best score, one-time login-prompt flag |
| `app/300par/page.js` | Server component, loads every registered team's season data, renders `DraftGame` |
| `components/Game/DraftGame.js` | Client component, the whole team-select + draft state machine |
| `components/Game/SeasonPlayerCard.js` | One player's draft card (ratings, disabled states) |
| `components/Game/BattingOrderStrip.js` | The 11-slot lineup strip, highlights eligible slots |
| `components/Game/ScoreBoard.js` | Post-simulation result screen |
| `components/Game/LoginNudgeModal.js` | One-time-per-session "sign in?" nudge after a result |

## Data: where the numbers come from

Each `data/teams/<CODE>.json` is **generated**, not hand-edited. To change a rating or add
a player, edit the raw stats in that team's `scripts/gen-<code>-squads.mjs` and regenerate:

```bash
node scripts/gen-srh-squads.mjs > data/teams/SRH.json
node scripts/gen-rcb-squads.mjs > data/teams/RCB.json
node scripts/gen-csk-squads.mjs > data/teams/CSK.json
node scripts/gen-mi-squads.mjs > data/teams/MI.json
```

Each entry is real per-season data researched from Wikipedia's `20XX <Team> season` pages /
ESPNcricinfo / IPLT20stats / web search — batting average, strike rate, bowling average,
economy, wickets, innings played. Sourcing confidence varies by year and is noted at the
top of each generator script:

- **SRH**: 2013-2017, 2019-2022, 2024 are fully-sourced exact tables. 2018, 2023, 2025,
  2026 are weaker — those seasons' pages only published top-line totals, so average/strike
  rate is estimated from real run/innings/boundary counts rather than pulled directly.
- **RCB**: 2011, 2018-2021, 2023-2026 are fully (or mostly, for the top order) sourced
  exact tables. 2008-2010, 2012-2017, 2022 are weaker — real season totals (runs, wickets)
  plus known per-year strike rates for the headline players (Kohli, Gayle, de Villiers),
  with the rest of the squad's average/SR estimated.
- **CSK**: 2008-2012, 2018-2021, 2023 are fully-sourced exact tables. 2013-2015, 2024-2026
  are partial-exact (top order runs/avg/SR solid; bowling economy estimated where the
  source only gave averages). 2022 is the weakest — only 4 batters and 1 bowler had
  published figures for the whole season.
- **MI**: 2010, 2019-2022 are fully-sourced exact tables. 2013-2018, 2023-2026 are
  partial-exact (top order runs/avg/SR solid, rest estimated). 2008, 2009, 2011, 2012 are
  the weakest — only top-line runs/wickets were published, so most ratings there lean on
  role/reputation rather than a sourced number.

Worth re-sourcing the weak years properly if better tables surface later.

**A caught bug worth knowing about**: Zaheer Khan was initially (wrongly) placed on RCB for
five seasons (2008, 2010-2013) — he was actually at Mumbai Indians that entire span (his
MI 2010 figures here are exact-sourced). The cross-team collision check below caught it
when MI was added; all five RCB entries were replaced with real players from those years'
actual rosters. This is exactly the failure mode the checklist step exists to catch — a
plausible-sounding name inserted into a `player()` list without being traced back to an
actual roster fetch for *that specific team, that specific year*.

**Roster depth**: every season is padded to **at least 14 real players** (currently 14-15
each), sourced from Wikipedia's full squad-roster tables (name/nationality/role), not just
the handful with published match stats. Depth players without individual stats use
conservative, role-appropriate estimates (e.g. a specialist bowler gets a modest bowling
average/economy, not an invented heroic one) with low `innings`/`wkts` so the rating
formula's small-sample dampening pulls them toward a moderate baseline rather than an
extreme rating in either direction — this is meant to read as "honestly uncertain/fringe,"
not fabricated. If a team's real squad genuinely had fewer than 14 players who ever got
picked, that's a signal to research harder before padding with names, not to invent players.

**Verified for internal consistency** before shipping: no player appears on two different
teams in the same real season (a physical impossibility - one bug of this kind was caught
and fixed, a name that had been guessed onto both SRH's and RCB's 2025 roster), and spot
checks of the highest-rated entries per team traced back to their sourced figures. If you
add a name and get it wrong, this is the class of bug to watch for - grep the *other*
team's file for the same name/year before trusting an addition.

### Rating formulas (`lib/game/ratingFormula.mjs`)

Three ratings per player-season, all roughly 0-100, shared by every team's generator so the
scale stays comparable across franchises:

**BAT** (survival / wicket-preservation) — from batting average:
```
BAT = 20 + average × 1.15
```
Small samples (< 4 innings) are dampened 70/30 toward a neutral baseline (32) so one fluke
knock doesn't produce an extreme rating. Clamped to [15, 96].

**POW** (scoring power) — from strike rate:
```
POW = (strikeRate - 60) × 0.9
```
Same < 4-innings dampening (60/40 toward 45). Clamped to [15, 98].

**BWL** (bowling quality) — only computed for players with ≥3 wickets that season and
`primary: true` (i.e. a real bowling contributor, not a part-timer's occasional over).
Everyone else gets a flat `8 + wkts×2` capped at 25.
```
ecoScore = (11 - economy) / 5.5 × 100
avgScore = (50 - bowlingAverage) / 36 × 100
BWL = 0.5 × ecoScore + 0.5 × avgScore, +4 bonus if wkts >= 15
```
Small wicket samples (< 8 wickets) are dampened 60/40 toward a baseline of 40 — this
matters: a part-time bowler's 3-5 wickets at a good average would otherwise falsely read
as "elite bowler." Clamped to [20, 95].

Pure batsmen have `BWL: 0`. All three ratings are hand-tunable per player by editing the
raw `{ avg, sr, innings }` / `{ avg, eco, wkts, primary }` inputs in the generator scripts.

## Slots & position eligibility (`lib/game/positions.js`)

11 fixed batting-order slots, each with a label and an eligible-role set baked into each
player's `slots` array in the dataset (not derived at runtime):

| Slot | Label | Typical eligible roles |
|---|---|---|
| 1-2 | Opener | Openers, some top-order |
| 3 | One-down | Top/middle order |
| 4-5 | Middle order | Middle order, batting all-rounders, flexible keepers |
| 6-7 | Finisher | Finishers, all-rounders, flexible keepers |
| 8 | Bowling all-rounder | Bowling all-rounders |
| 9-11 | Bowler | Specialist bowlers |

A player's `slots` array is an explicit list of slot numbers they can fill (e.g. a pure
opener is `[1,2]`; a flexible keeper like Klaasen or AB de Villiers is `[2,3,4,5,6,7]`).
The draft UI only lets you place a picked player into an empty slot that's in their `slots`
array — `eligibleEmptySlots()` / `isPlayerPickable()` in `positions.js` do this filtering,
so illegal placement is prevented mechanically rather than validated after the fact.

## Draft rules (enforced in `DraftGame.js`)

- **Choose a team first.** If more than one team is registered, a dropdown gates the draft
  (skipped automatically if only one team exists). "Change Team" mid-draft resets the run.
- 11 turns. Each turn shows one random season's squad; pick one player into any of their
  still-empty eligible slots.
- A player already picked, or with no eligible empty slot left, shows disabled.
- **Max 4 overseas players** (`MAX_FOREIGNERS`) — once hit, all foreign-flagged
  (`country !== 'India'`) players grey out for the rest of the draft.
- **One free "Skip Year"** per game — rerolls the current turn's random year without
  spending a pick. Disabled after first use, resets on Play Again.
- Bowler count (slots 8-11) and keeper-picked status are shown as a soft, non-blocking
  info readout — not hard-enforced. If you want to hard-enforce "must have exactly 1
  keeper" or "must have exactly 4 bowlers," that's the place to add it.

### Deadlock prevention

A turn can, in principle, land on a year where every player is already disabled — already
picked, out of eligible slots, or foreigner-capped (RCB's foreign-heavy, thin early-era
rosters hit this in testing). If that year is also offered *after* the free skip is spent,
the player would be stuck with no legal move. To prevent this, **every year the game offers
is pre-filtered to years with at least one legal pick** (`pickPlayableYear()` in
`DraftGame.js`, backed by `yearIsPlayable()`), checked against the picks/slots/foreigner-cap
state at that exact moment — on initial load, after every pick, on skip, and on Play Again.
A deck this size should never run out of playable years before 11 picks are in, but the
function falls back to the unfiltered year pool if it ever does, rather than crashing.
Verified with a 2000-iteration randomized-draft stress test against both SRH and RCB data
(zero deadlocks) before shipping — worth re-running the same kind of check after adding a
new team, especially one with a small early-era roster.

## Simulation (`lib/game/simulate.js`)

Rating-based, not a pairwise player-vs-player lookup table — deliberately simpler than
literal historical chemistry, per the original design tradeoff. `simulateChase(battingOrder)`
takes the 11 picked players **in slot order** (index 0 = slot 1) and returns:

```js
{ batsmen, overSummaries, totalRuns, moraleBonus, finalScore, wickets, oversUsed, ballsFaced, target, won }
```

**Per ball**, for the current striker:
1. Dismissal check: `dismissalChance(BAT) = clamp(0.085 - BAT/100 × 0.062, 0.014, 0.075)`.
   Rolled against `Math.random()`. Elite BAT (~90+) → ~2.3% chance/ball; tail-ender
   (~20) → ~7.2%/ball.
2. If not out: runs come from `ballRuns(POW, pairSynergy, rng)` — a weighted random pick
   over `{0,1,2,3,4,6}` where the weight on 4s/6s scales with `POW` and a small
   **partnership synergy** multiplier (`pairSynergy`, the current striker+non-striker's
   combined BAT+POW average, clamped to 0.85-1.2×). This is the "who's batting with whom"
   effect the original brief asked for, kept intentionally lightweight rather than a full
   pairwise table.
3. Odd runs rotate strike; end of over always rotates strike.
4. A wicket brings in the next player in slot order; 10 wickets ends the innings early
   (remaining players marked `dnb: true`).

**After the innings**: a flat one-time **bowler-morale bonus** is added —
`moraleBonus = round((avgBWL(slots 8-11) - 50) / 50 × 15)`, i.e. a strong bowling unit
adds a small confidence bonus to the whole chase, a weak one subtracts. `finalScore =
totalRuns + moraleBonus`, floored at 0. `won = finalScore >= 300`.

Every call is stochastic (`Math.random()` by default, but the function accepts an
injectable `rng` for testing) — **the same XI in the same slots will score differently
every time you simulate.** Ratings set odds, not outcomes; this is intentional (see commit
history for the design discussion) — not a bug to "fix" without a deliberate product call.

### Difficulty calibration

The `ballRuns` weight coefficients were hand-tuned so that a genuinely elite real-history XI
(e.g. peak Warner/Head/Klaasen/Bhuvneshwar/Rashid for SRH, or peak Kohli/Gayle/de
Villiers/Chahal for RCB) wins **~20%** of simulations, a merely good draft **<1%**, and a
weak early-era draft **~0%**. The formula and its tuning are team-agnostic (it only reads
BAT/POW/BWL off whatever `battingOrder` it's given), so this calibration should hold for
any new team using the same rating scale — but re-check it if a new team's rating
distribution looks unusually high or low compared to SRH/RCB. Quick way to check:

```js
import { simulateChase } from './lib/game/simulate.js';
let wins = 0, n = 500;
for (let i = 0; i < n; i++) if (simulateChase(someEliteXI).won) wins++;
console.log(wins / n); // target ~0.20 for an elite XI
```

## Persistence (`lib/game/localHistory.js`)

`localStorage` only, key `srh300par:history` — capped list of the last 20 runs
(`{ score, wickets, won, team, xi, timestamp }`). `getBestScore()` reads from it (currently
best-across-all-teams; scope it by `team` if per-team bests are wanted later). No login
gate exists on solo play — it was removed along with the one-time sign-in nudge modal that
used to show after a result (see commit history); solo mode has zero auth dependency.

## Adding a new team

1. Research that team's real per-season stats (Wikipedia `20XX <Team> season` pages are the
   best first stop; fall back to ESPNcricinfo/IPLT20stats/web search for years with thin
   Wikipedia tables — expect this, most franchises don't have full tables for every year).
2. Write `scripts/gen-<code>-squads.mjs`, modeled on `gen-rcb-squads.mjs`: import
   `makePlayer` from `lib/game/ratingFormula.mjs`, define a `seasons` object keyed by year,
   `console.log(JSON.stringify(seasons, null, 2))` at the bottom. Aim for **>=14 real
   players per season** — pull the full squad-roster table (not just the stats table) from
   each year's Wikipedia page to find enough real depth names.
3. `node scripts/gen-<code>-squads.mjs > data/teams/<CODE>.json`
4. Add the team to `data/teams/index.js`.
5. Import the new JSON and add it to `TEAM_DATA` in `lib/data/seasonSquads.js`.
6. Sanity-check before calling it done:
   - Run a quick script like the stress test described above against the new team's JSON —
     thin/foreign-heavy rosters are exactly what triggers deadlocks (see "Deadlock prevention").
   - Confirm every season has >=14 entries.
   - Grep the new team's player names against every other team's file, year by year, for
     same-season collisions (a player can't be on two teams in one real season) — see
     "Roster depth" above for the bug this caught during RCB's addition.

## 1v1 Duel (`app/300par/duel/`)

A second, separate mode: two signed-in users draft their own XIs from the same team's
history in alternating turns (22 picks total), then their innings are compared head-to-head
(the second team chases the first team's actual score, not a fixed 300). Unlike solo mode,
this **requires a backend** — real-time turn sync between two browsers and a user directory
to find an opponent. Full design/decisions/data-model are in the plan this was built from;
this section documents what's actually shipped as it lands, phase by phase.

**Why Firestore, not a new realtime vendor**: this app already has Firebase wired in
(`lib/firebase.js`). Firestore's free tier has no hard concurrent-connection ceiling (the
limit is a daily read/write quota, which comfortably covers this app's realistic scale) and
avoids running a second user-identity system alongside Clerk. See git history around this
feature's introduction for the fuller comparison against Supabase Realtime.

**Status: Phases 1-2 shipped and verified.** User directory, full room lifecycle
(create/join/toss), alternating 22-turn draft sync, dual simulation, and a dashboard are all
live. Firestore rules are published (open rules for `users`/`duelRooms`/`duelRooms/{id}/picks`/
`duelResults`, alongside the pre-existing `matches`/`news` rules). A full transaction-level
flow test (room create → join/toss race guards → all 22 picks → dual `simulateChase` →
concurrent `finalizeResult` race) passed against the live rules; only a composite index
(below) and a manual two-browser UI pass remain.

### Phase 1 — user directory

- `app/api/webhooks/clerk/route.js` — verifies the request via `@clerk/nextjs/webhooks`'s
  `verifyWebhook()` (reads `CLERK_WEBHOOK_SIGNING_SECRET`), and on a `user.created` event
  writes `{ displayName, displayNameLower, photoURL, createdAt }` to Firestore
  `users/{clerkUserId}` via the Admin SDK. Configure this URL in the Clerk Dashboard →
  Webhooks once deployed (needs a real public URL — a local dev server can't receive it
  without a tunnel). Only fires for *new* sign-ups; existing users need a one-time backfill
  (see `scripts/` git history for the throwaway script used to do this once — it wasn't kept
  in the repo since it embeds no secrets but has no reason to be run twice).
- `lib/firebaseAdmin.js` — server-only Admin SDK init (`getAdminDb()`), reads
  `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` (from a Firebase
  service-account key — Project Settings → Service Accounts → Generate new private key,
  free, same project/quota as everything else).
- `lib/data/users.js` — `getOpponentCandidates()`, a **client-SDK** read of `users`,
  `orderBy('createdAt', 'desc').limit(200)`, fetched once per page visit.
- `components/Duel/OpponentList.js` — renders that list, filters/searches **entirely
  client-side** (debounced 200ms for UI smoothness only — zero additional Firestore reads
  per keystroke). Revisit only if the user base grows past a few hundred and fetch-all stops
  being cheap; the upgrade path is a server-side prefix-range query on `displayNameLower`.

### Phase 2 — room lifecycle, draft sync, dual simulation, dashboard

- `lib/duel/room.js` — every state transition is a Firestore transaction: `createRoom`,
  `joinRoom` (also computes the coin-flip toss atomically, so two guests racing to open the
  same link can't both "win" it), `chooseFirstPicker`, `submitPick` (checks it's genuinely
  this uid's turn and this turn index hasn't already been played — guards double-clicks and
  turn-order violations), `finalizeResult` (checks `status` is still `'simulating'` before
  writing, so if both clients race to finalize, only the first one's write sticks — the
  loser's locally-computed result is discarded, and that client picks up the authoritative
  result via its existing `onSnapshot` subscription instead of trusting its own computation).
- Picks are **exclusive across the whole room** — once either player has drafted a given
  player-season, the other can't also draft it (`allPickedNames` in
  `components/Duel/DuelDraftBoard.js` is built from *all* picks, not just the current
  player's). This was a judgment call, not explicitly specified — it's what makes watching
  the opponent's picks matter strategically instead of two isolated solo drafts running side
  by side.
- `pickPlayableYear()`/`yearIsPlayable()` moved from being private to `DraftGame.js` into
  `lib/game/positions.js` as shared exports — both solo mode and `DuelDraftBoard.js` need the
  exact same "don't offer a year with zero legal picks" logic, and it needs to stay identical
  between them rather than drift as two copies.
- `simulateChase()` (`lib/game/simulate.js`) gained a third, optional `target` param
  (defaults to `300`, solo mode's call sites are unchanged) — the room page runs it twice:
  once for the host with the default target, once for the guest with `target =
  hostResult.finalScore`, so `won` on the guest's result IS the duel's win condition.
- `components/Duel/TossPanel.js`, `DuelDraftBoard.js` (reuses `SeasonPlayerCard` +
  `BattingOrderStrip` from solo mode, shows both players' boards live), `DuelResult.js`
  (reuses `LivePlayback` twice in sequence — host's innings, then guest's chasing it — then a
  winner banner).
- `app/300par/duel/[roomId]/page.js` — the room itself, one big phase switch on
  `room.status`: `waiting` (join or share-link view, `isRoomExpired()` gates a stale invite)
  → `toss` → `drafting` → `simulating` (exactly one client's browser actually runs the
  simulation, guarded by a `useRef` so it only attempts once per page load; `finalizeResult`
  is what actually decides whose result "wins" the race) → `complete`.
- `lib/data/duelResults.js` + `app/dashboard/page.js` — `duelResults` queried by
  `where('participants', 'array-contains', uid)`. New "Dashboard" nav link in
  `components/Navbar.js`, shown only when signed in.

### Rules — published, with one regression caught and fixed

Confirmed empirically (not just "no rules file exists") that an unauthenticated Firestore
client read/write to a brand-new collection was denied, and critically, **Clerk sessions
never populate Firestore's `request.auth`** (no Clerk↔Firebase-Auth bridge in this app), so a
rule written as `if request.auth != null` would deny every request from this app, signed in or
not. Consistent with the client-trusted model, the new collections got open rules:
```
match /users/{uid} { allow read, write: if true; }
match /duelRooms/{roomId} {
  allow read, write: if true;
  match /picks/{turnIndex} { allow read, write: if true; }
}
match /duelResults/{id} { allow read, write: if true; }
```
First publish accidentally dropped the pre-existing `matches`/`news` rules (`npm run build`
caught this — both pages failed static prerender with `permission-denied`). Re-published with
`matches`/`news` open rules restored alongside the new ones; a follow-up probe confirmed reads
succeed on all five collections and `npm run build` is clean.

### Still open

- **Composite index** for the dashboard's query (`array-contains` + `orderBy` on a different
  field always needs one). The first time `getDuelHistory()` runs against live data with
  enough rows to trip it, Firestore throws an error containing a direct console link to create
  the exact index needed — click it once, no manual configuration.
- **Manual two-browser UI pass** (join via shared link, real toss/draft/result UI end to end)
  — the transaction logic itself is verified (see Status above), but nobody has clicked
  through the actual pages with two signed-in accounts yet.

## Likely future enhancements

- Hard-enforce squad composition (exactly 1 keeper, exactly 4 bowlers) instead of the
  current soft readout.
- Re-source the weak-confidence years (noted above, per team) with exact stats once fuller
  tables are published.
- Expand rosters beyond ~13-15 players/season if more real contributors surface.
- Leaderboard for solo mode (would need a backend — still explicitly out of scope for solo
  play, which stays local-only by design; the 1v1 Duel mode above is a separate, deliberately
  backend-dependent feature and doesn't change this).
- Ball-by-ball commentary feed using `overSummaries` (currently computed but unused in the UI).
- Per-team theming (logo, accent color) — currently every team uses the site's fixed
  orange/dark theme; `data/teams/index.js` would be the place to add a `color` field.

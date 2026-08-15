# 300 Par

Fan-made draft-and-simulate game, inspired by [500-0.com](https://500-0.com). Draft an
11-player SRH XI from across IPL seasons 2013-2026 (one random season offered per turn),
then simulate a 20-over chase. No IPL team has ever scored 300 in a T20 innings — hitting
it here is meant to be rare (roughly a 1-in-5 shot with a genuinely elite historical draft,
near-zero with a weak one).

Fully client-side. No Firestore/backend involved — game state lives in React state during
a run, and only a lightweight history/best-score gets written to `localStorage`.

## File map

| File | Role |
|---|---|
| `data/SeasonSquads.json` | Static dataset: real per-season SRH players (2013-2026), ~13/season, with ratings and slot eligibility |
| `scripts/gen-season-squads.mjs` | **Source of truth for the dataset.** Turns raw researched stats into `SeasonSquads.json` via the rating formulas below |
| `lib/data/seasonSquads.js` | Thin loader (`getSeasonSquads()`, `getSquadForYear(year)`), mirrors `lib/data/players.js` |
| `lib/game/positions.js` | Batting-order slot labels (1-11) + slot-eligibility helpers |
| `lib/game/simulate.js` | Pure function `simulateChase(battingOrder)` — the ball-by-ball chase sim |
| `lib/game/localHistory.js` | `localStorage` helpers: run history, best score, one-time login-prompt flag |
| `app/300par/page.js` | Server component, loads season data, renders `DraftGame` |
| `components/Game/DraftGame.js` | Client component, the whole draft state machine |
| `components/Game/SeasonPlayerCard.js` | One player's draft card (ratings, disabled states) |
| `components/Game/BattingOrderStrip.js` | The 11-slot lineup strip, highlights eligible slots |
| `components/Game/ScoreBoard.js` | Post-simulation result screen |
| `components/Game/LoginNudgeModal.js` | One-time-per-session "sign in?" nudge after a result |

## Data: where the numbers come from

`SeasonSquads.json` is **generated**, not hand-edited. To change a rating or add a player,
edit the raw stats in `scripts/gen-season-squads.mjs` and regenerate:

```bash
node scripts/gen-season-squads.mjs > data/SeasonSquads.json
```

Each entry is real per-season data researched from Wikipedia's `20XX Sunrisers Hyderabad
season` pages / ESPNcricinfo / IPLT20stats — batting average, strike rate, bowling average,
economy, wickets, innings played. 2013-2017, 2019-2022, and 2024 have fully-sourced exact
tables. **2018, 2023, 2025, and 2026 are weaker** — those seasons' Wikipedia pages only
published top-line totals (runs, wickets, boundary counts), so average/strike-rate for
those years are estimated from real run/innings/boundary counts rather than pulled
directly. Worth re-sourcing properly if better data surfaces later.

### Rating formulas (`scripts/gen-season-squads.mjs`)

Three ratings per player-season, all roughly 0-100:

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
raw `{ avg, sr, innings }` / `{ avg, eco, wkts, primary }` inputs in the generator script.

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
opener is `[1,2]`; a flexible keeper like Klaasen is `[2,3,4,5,6,7]`). The draft UI only
lets you place a picked player into an empty slot that's in their `slots` array —
`eligibleEmptySlots()` / `isPlayerPickable()` in `positions.js` do this filtering, so
illegal placement is prevented mechanically rather than validated after the fact.

## Draft rules (enforced in `DraftGame.js`)

- 11 turns. Each turn shows one random IPL season's squad (`randomYear()`); pick one
  player into any of their still-empty eligible slots.
- A player already picked, or with no eligible empty slot left, shows disabled.
- **Max 4 overseas players** (`MAX_FOREIGNERS`) — once hit, all foreign-flagged
  (`country !== 'India'`) players grey out for the rest of the draft.
- **One free "Skip Year"** per game — rerolls the current turn's random year (excluding
  the one just skipped) without spending a pick. Disabled after first use, resets on
  Play Again.
- Bowler count (slots 8-11) and keeper-picked status are shown as a soft, non-blocking
  info readout — not hard-enforced. If you want to hard-enforce "must have exactly 1
  keeper" or "must have exactly 4 bowlers," that's the place to add it.

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
every time you simulate.** Ratings set odds, not outcomes.

### Difficulty calibration

The `ballRuns` weight coefficients were hand-tuned (see stress-test notes in commit
history) so that a genuinely elite real-history XI (e.g. peak Warner, Head, Klaasen,
Bhuvneshwar, Rashid) wins **~20%** of simulations, a merely good draft **<1%**, and a
weak early-era draft **~0%**. If ratings or the formula change, re-run a stress test
before shipping — a quick way:

```js
import { simulateChase } from './lib/game/simulate.js';
let wins = 0, n = 500;
for (let i = 0; i < n; i++) if (simulateChase(someEliteXI).won) wins++;
console.log(wins / n); // target ~0.20 for an elite XI
```

## Persistence (`lib/game/localHistory.js`)

`localStorage` only, key `srh300par:history` — capped list of the last 20 runs
(`{ score, wickets, won, xi, timestamp }`). `getBestScore()` reads from it. Separately,
`sessionStorage` key `srh300par:loginPromptShown` gates the one-per-session
`LoginNudgeModal` (shown once, after the first result of the session, only if the user
isn't signed in via Clerk).

## Likely future enhancements

- Hard-enforce squad composition (exactly 1 keeper, exactly 4 bowlers) instead of the
  current soft readout.
- Re-source 2018/2023/2025/2026 with exact stats once fuller tables are published.
- Expand `SeasonSquads.json` beyond ~13 players/season if more real contributors surface.
- Leaderboard (would need a backend — currently explicitly out of scope, local-only by
  design).
- Ball-by-ball commentary feed using `overSummaries` (currently computed but unused in the UI).

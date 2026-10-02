// Shared by every scripts/gen-<team>-squads.mjs generator. Keep formula changes here so all
// teams stay on the same rating scale (see app/300par/README.md for the full writeup).

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round(v) { return Math.round(v); }

// Season runs: exact when the caller passes `runs` (real stats), else approximated as
// avg * innings (slightly generous because of not-outs). Used only to reward volume - a
// 700-run season should rate above a 250-run season at the same average/SR. Needs a real
// sample (>= 8 innings) so a couple of big knocks don't count as a season.
function volume({ runs, avg, innings }) {
    if (innings < 8) return 0;
    return runs != null ? runs : avg * innings;
}

// With exact runs we can also tell how many balls a player faced (runs / SR). A 20-ball cameo
// at SR 200 shouldn't read as elite power, so low-sample rates are pulled toward a neutral
// baseline - fully trusted from 100 balls up. No-op when `runs` isn't supplied.
function sampleWeight({ runs, sr }) {
    if (runs == null || !sr) return 1;
    return clamp(((runs * 100) / sr) / 100, 0, 1);
}

// BAT: survival/quality, driven by batting average, plus a small volume bonus (up to +4).
// Small samples (few innings / few balls) are dampened toward a neutral baseline so one
// lucky/unlucky knock doesn't swing the rating.
export function batRating(stats) {
    const { avg = 0, innings = 10 } = stats;
    const w = sampleWeight(stats);
    let bat = 20 + (avg * w + 15 * (1 - w)) * 1.15;
    if (innings < 4) bat = bat * 0.7 + 32 * 0.3;
    bat += clamp((volume(stats) - 350) / 120, 0, 4);
    return clamp(round(bat), 15, 96);
}

// POW: scoring power, driven by strike rate. Above SR 135 the curve gets steeper so genuinely
// explosive seasons separate from merely good ones, and a volume bonus (up to +8) rewards
// sustaining that power over a whole season. Same small-sample dampening.
export function powRating(stats) {
    const { sr = 0, innings = 10 } = stats;
    const w = sampleWeight(stats);
    const eff = sr * w + 100 * (1 - w);
    let pow = (eff - 60) * 0.9 + Math.max(0, eff - 135) * 0.4;
    if (innings < 4) pow = pow * 0.6 + 45 * 0.4;
    pow += clamp((volume(stats) - 350) / 60, 0, 8);
    return clamp(round(pow), 15, 98);
}

// BWL: only meaningful for genuine bowling contributors (>=3 wickets that season).
// Blends economy-rate score and bowling-average score.
export function bwlRating({ avg = 0, eco = 0, wkts = 0, primary = true }) {
    if (!primary || wkts < 3) return clamp(round(8 + wkts * 2), 0, 25);
    const ecoScore = clamp(((11 - eco) / 5.5) * 100, 0, 100);
    const avgScore = clamp(((50 - avg) / 36) * 100, 0, 100);
    let bwl = 0.5 * ecoScore + 0.5 * avgScore;
    if (wkts >= 15) bwl += 4;
    if (wkts < 8) bwl = bwl * 0.6 + 40 * 0.4; // dampen small bowling samples (few wickets) toward a moderate baseline
    return clamp(round(bwl), 20, 95);
}

export function makePlayer(name, country, role, slots, isKeeper, bat, bowl) {
    const BAT = bat ? batRating(bat) : 20;
    const POW = bat ? powRating(bat) : 20;
    const BWL = bowl ? bwlRating(bowl) : 0;
    return { name, role, battingStyle: '-', bowlingStyle: '-', country, isKeeper, slots, BAT, POW, BWL };
}

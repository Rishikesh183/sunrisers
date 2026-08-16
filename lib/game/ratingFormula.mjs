// Shared by every scripts/gen-<team>-squads.mjs generator. Keep formula changes here so all
// teams stay on the same rating scale (see app/300par/README.md for the full writeup).

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round(v) { return Math.round(v); }

// BAT: survival/quality, driven by batting average. Small samples (few innings) are
// dampened toward a neutral baseline so one lucky/unlucky knock doesn't swing the rating.
export function batRating({ avg = 0, innings = 10 }) {
    let bat = 20 + avg * 1.15;
    if (innings < 4) bat = bat * 0.7 + 32 * 0.3;
    return clamp(round(bat), 15, 96);
}

// POW: scoring power, driven by strike rate. Same small-sample dampening.
export function powRating({ sr = 0, innings = 10 }) {
    let pow = (sr - 60) * 0.9;
    if (innings < 4) pow = pow * 0.6 + 45 * 0.4;
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

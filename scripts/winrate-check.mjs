// Monte Carlo win-rate check for 300 Par. Drafts with a greedy "decent player" policy (random
// season each turn like the real game, then the best available player+slot by rating) and
// simulates the chase, per team and difficulty.
//
// Usage: node scripts/winrate-check.mjs [teamsDir] [drafts]
//   teamsDir defaults to data/teams; pass another folder of <CODE>.json to compare datasets.

import fs from 'node:fs';
import path from 'node:path';
import { simulateChase } from '../lib/game/simulate.js';
import { pickPlayableYear, TOTAL_SLOTS } from '../lib/game/positions.js';

const dir = process.argv[2] || 'data/teams';
const N = Number(process.argv[3] || 1500);
const MAX_FOREIGN = 4;

function draft(squads, years) {
    const filled = {};
    const picked = new Set();
    const slots = new Set();
    let foreign = 0;
    for (let turn = 0; turn < TOTAL_SLOTS; turn++) {
        const year = pickPlayableYear(years, squads, picked, slots, foreign >= MAX_FOREIGN);
        let best = null;
        for (const p of squads[String(year)] || []) {
            if (picked.has(p.name)) continue;
            if (p.country !== 'India' && foreign >= MAX_FOREIGN) continue;
            for (const s of p.slots) {
                if (slots.has(s)) continue;
                const value = s >= 8 ? p.BWL * 0.6 + (p.BAT + p.POW) * 0.2 : (p.BAT + p.POW) / 2 + p.BWL * 0.1;
                if (!best || value > best.value) best = { p, s, value };
            }
        }
        if (!best) return null; // dead end (shouldn't happen)
        filled[best.s] = best.p;
        picked.add(best.p.name);
        slots.add(best.s);
        if (best.p.country !== 'India') foreign++;
    }
    return Array.from({ length: TOTAL_SLOTS }, (_, i) => filled[i + 1]);
}

const mean = { hard: 0, easy: 0 };
for (const code of ['SRH', 'RCB', 'CSK', 'MI']) {
    const squads = JSON.parse(fs.readFileSync(path.join(dir, `${code}.json`), 'utf8'));
    const years = Object.keys(squads).map(Number).sort();
    const out = { hard: 0, easy: 0 };
    let dead = 0;
    let total = 0;
    let scoreSum = { hard: 0, easy: 0 };
    for (let i = 0; i < N; i++) {
        const xi = draft(squads, years);
        if (!xi || xi.some((p) => !p)) { dead++; continue; }
        total++;
        for (const d of ['hard', 'easy']) {
            const r = simulateChase(xi, Math.random, 300, d);
            if (r.won) out[d]++;
            scoreSum[d] += r.finalScore;
        }
    }
    mean.hard += out.hard / total / 4;
    mean.easy += out.easy / total / 4;
    const pct = (n) => ((n / total) * 100).toFixed(1) + '%';
    console.log(
        `${code}  hard ${pct(out.hard)} (avg ${(scoreSum.hard / total).toFixed(0)})  easy ${pct(out.easy)} (avg ${(scoreSum.easy / total).toFixed(0)})  dead-drafts ${dead}`
    );
}
console.log(`MEAN  hard ${(mean.hard * 100).toFixed(1)}%  easy ${(mean.easy * 100).toFixed(1)}%`);

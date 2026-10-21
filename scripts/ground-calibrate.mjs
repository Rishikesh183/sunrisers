// Calibrates duel grounds (lib/game/grounds.js). For each ground it simulates first innings of
// greedily-drafted XIs against random opposing XIs and prints:
//   avg      - mean score (targets: Hyderabad ~240, Mumbai ~220, Chennai ~170, Bengaluru ~255)
//   swing    - mean score vs a WEAK attack minus vs a STRONG attack (the "bowler weightage";
//              targets: Hyderabad 10-15, Mumbai 15-20, Chennai 25-30, Bengaluru 10-15)
//   star/avg - the same two batters on every ground, to show scores scale together
//
// Usage: node scripts/ground-calibrate.mjs [drafts]
import fs from 'node:fs';
import { simulateChase, bowlingStrength } from '../lib/game/simulate.js';
import { GROUND_LIST } from '../lib/game/grounds.js';
import { pickPlayableYear, TOTAL_SLOTS } from '../lib/game/positions.js';

const N = Number(process.argv[2] || 1500);
const WEAK = 58;
const STRONG = 82;

function draft(squads, years) {
    const filled = {}, picked = new Set(), slots = new Set();
    let foreign = 0;
    for (let t = 0; t < TOTAL_SLOTS; t++) {
        const year = pickPlayableYear(years, squads, picked, slots, foreign >= 4);
        let best = null;
        for (const p of squads[String(year)] || []) {
            if (picked.has(p.name)) continue;
            if (p.country !== 'India' && foreign >= 4) continue;
            for (const s of p.slots) {
                if (slots.has(s)) continue;
                const v = s >= 8 ? p.BWL * 0.6 + (p.BAT + p.POW) * 0.2 : (p.BAT + p.POW) / 2 + p.BWL * 0.1;
                if (!best || v > best.v) best = { p, s, v };
            }
        }
        if (!best) return null;
        filled[best.s] = best.p; picked.add(best.p.name); slots.add(best.s);
        if (best.p.country !== 'India') foreign++;
    }
    return Array.from({ length: TOTAL_SLOTS }, (_, i) => filled[i + 1]);
}

const pool = [];
for (const code of ['SRH', 'RCB', 'CSK', 'MI']) {
    const squads = JSON.parse(fs.readFileSync(`data/teams/${code}.json`, 'utf8'));
    const years = Object.keys(squads).map(Number);
    for (let i = 0; i < N / 4; i++) {
        const xi = draft(squads, years);
        if (xi && xi.every(Boolean)) pool.push(xi);
    }
}
const attack = pool.map(bowlingStrength);
console.log(`pool: ${pool.length} XIs, attack strength p10/p50/p90 = ${[0.1, 0.5, 0.9].map((q) => [...attack].sort((a, b) => a - b)[Math.floor(q * attack.length)].toFixed(0)).join('/')}`);

const run = (ground, oppStrength) => {
    let sum = 0, n = 0;
    for (let rep = 0; rep < 3; rep++) {
        for (let i = 0; i < pool.length; i++) {
            const opp = oppStrength ?? attack[(i * 7 + 13 + rep * 101) % pool.length];
            sum += simulateChase(pool[i], Math.random, null, 'duel', false, opp, ground).finalScore;
            n++;
        }
    }
    return sum / n;
};

console.log('ground      avg    weakAtk strongAtk  swing');
for (const g of [null, ...GROUND_LIST.map((x) => x.key)]) {
    const avg = run(g, undefined);
    const weak = run(g, WEAK);
    const strong = run(g, STRONG);
    console.log(`${(g || 'default').padEnd(10)} ${avg.toFixed(0).padStart(5)}   ${weak.toFixed(0).padStart(6)}  ${strong.toFixed(0).padStart(8)}  ${(weak - strong).toFixed(1).padStart(6)}`);
}

// Same two batters everywhere: an elite opener and a modest middle-order man, opened and 1-down.
const star = { name: 'Star', BAT: 94, POW: 90, BWL: 0 };
const mid = { name: 'Mid', BAT: 52, POW: 55, BWL: 0 };
const filler = { name: 'F', BAT: 45, POW: 45, BWL: 20 };
const order = [star, mid, ...Array.from({ length: 9 }, () => ({ ...filler }))];
console.log('\nsame batters per ground (avg runs / balls over many innings):');
for (const g of [null, ...GROUND_LIST.map((x) => x.key)]) {
    let sr = 0, sb = 0, mr = 0, mb = 0;
    const M = 4000;
    for (let i = 0; i < M; i++) {
        const r = simulateChase(order, Math.random, null, 'duel', false, 70, g);
        sr += r.batsmen[0].runs; sb += r.batsmen[0].balls; mr += r.batsmen[1].runs; mb += r.batsmen[1].balls;
    }
    console.log(`${(g || 'default').padEnd(10)} star ${(sr / M).toFixed(0)}(${(sb / M).toFixed(0)})   mid ${(mr / M).toFixed(0)}(${(mb / M).toFixed(0)})`);
}

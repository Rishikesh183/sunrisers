const TOTAL_BALLS = 120;
const TARGET = 300;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Higher BAT = lower per-ball dismissal chance. Tail-enders (BAT ~20) get out roughly
// every ~11 balls on average; elite batters (BAT ~90+) survive far longer.
function dismissalChance(BAT) {
    return clamp(0.085 - (BAT / 100) * 0.062, 0.014, 0.075);
}

// Runs-per-ball distribution shaped by POW (boundary/strike-rate power) and a small
// partnership-synergy multiplier from the current batting pair's combined quality.
// Weighted-bucket pick so the ceiling (maxed POW + synergy) can realistically clear
// 300 in rare, high-variance runs, while an average lineup sits well below it.
function ballRuns(POW, pairFactor, rng) {
    const t = clamp((POW / 100) * pairFactor, 0, 1.3);
    const weights = [
        [0, 0.33 - 0.15 * t],
        [1, 0.36],
        [2, 0.10],
        [3, 0.015],
        [4, 0.11 + 0.14 * t],
        [6, 0.035 + 0.11 * t],
    ];
    const total = weights.reduce((sum, [, w]) => sum + Math.max(w, 0.01), 0);
    let roll = rng() * total;
    for (const [runs, w] of weights) {
        roll -= Math.max(w, 0.01);
        if (roll <= 0) return runs;
    }
    return 1;
}

function pairSynergy(a, b) {
    const combined = (a.BAT + a.POW + b.BAT + b.POW) / 4;
    return clamp(combined / 75, 0.85, 1.2);
}

/**
 * Simulates a 20-over T20 chase for an 11-player batting order (index 0 = slot 1 ... index 10 = slot 11).
 * Pure function, no DOM/React - safe to call from client components.
 */
export function simulateChase(battingOrder, rng = Math.random) {
    const stats = battingOrder.map((player) => ({
        name: player.name,
        runs: 0,
        balls: 0,
        out: false,
        dnb: true,
    }));

    let strikerIdx = 0;
    let nonStrikerIdx = 1;
    let nextInIdx = 2;
    let wickets = 0;
    let totalRuns = 0;
    const overSummaries = [];

    stats[0].dnb = false;
    stats[1].dnb = false;

    let ball = 0;
    outer: for (let over = 0; over < 20; over++) {
        let overRuns = 0;
        for (let b = 0; b < 6; b++) {
            if (wickets >= 10) break outer;
            ball++;

            const striker = battingOrder[strikerIdx];
            const nonStriker = battingOrder[nonStrikerIdx];
            const synergy = pairSynergy(striker, nonStriker);

            const outThisBall = rng() < dismissalChance(striker.BAT);
            stats[strikerIdx].balls++;

            if (outThisBall) {
                stats[strikerIdx].out = true;
                wickets++;
                totalRuns += 0;
                if (wickets >= 10 || nextInIdx > 10) break outer;
                strikerIdx = nextInIdx;
                stats[strikerIdx].dnb = false;
                nextInIdx++;
                continue;
            }

            const runs = ballRuns(striker.POW, synergy, rng);
            stats[strikerIdx].runs += runs;
            totalRuns += runs;
            overRuns += runs;

            if (runs % 2 === 1) {
                [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
            }
        }
        overSummaries.push(overRuns);
        [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
    }

    const bowlers = battingOrder.slice(7, 11);
    const avgBowlerRating = bowlers.reduce((sum, p) => sum + p.BWL, 0) / (bowlers.length || 1);
    const moraleBonus = Math.round(((avgBowlerRating - 50) / 50) * 15);

    const finalScore = Math.max(0, totalRuns + moraleBonus);
    const oversUsed = Math.min(20, Math.ceil(ball / 6));

    return {
        batsmen: stats,
        overSummaries,
        totalRuns,
        moraleBonus,
        finalScore,
        wickets,
        oversUsed,
        ballsFaced: ball,
        target: TARGET,
        won: finalScore >= TARGET,
    };
}

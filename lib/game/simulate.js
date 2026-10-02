const TOTAL_BALLS = 120;
const TARGET = 300;

// Hard = the original calibration, tuned up slightly (~20% -> ~25% win rate for an elite
// draft) and narrowed (dismissMult/dismissFloor/dismissCeil closer together = less pure-luck
// swing between a tail-ender and a star). Easy roughly doubles that to ~45% by cutting
// dismissal chance and boosting boundary power - same mechanic, just softer.
const DIFFICULTY = {
    hard: { dismissMult: 0.8, dismissFloor: 0.017, dismissCeil: 0.064, powerBoost: 1.06 },
    easy: { dismissMult: 0.56, dismissFloor: 0.012, dismissCeil: 0.047, powerBoost: 1.17 },
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Higher BAT = lower per-ball dismissal chance. Tail-enders (BAT ~20) get out roughly
// every ~11 balls on average; elite batters (BAT ~90+) survive far longer.
function dismissalChance(BAT, config) {
    return clamp((0.078 - (BAT / 100) * 0.058) * config.dismissMult, config.dismissFloor, config.dismissCeil);
}

// Runs-per-ball distribution shaped by POW (boundary/strike-rate power) and a small
// partnership-synergy multiplier from the current batting pair's combined quality.
// Weighted-bucket pick so the ceiling (maxed POW + synergy) can realistically clear
// 300 in rare, high-variance runs, while an average lineup sits well below it.
function ballRuns(POW, pairFactor, rng, powerBoost) {
    const t = clamp((POW / 100) * pairFactor * powerBoost, 0, 1.3);
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

// A good bowling unit earns extras (wides, no-balls, byes, leg-byes) - the old end-of-innings
// "bowler morale" bonus, now scattered through the innings like real extras. Floored at 0
// because extras can't be negative; elite units (the only ones that win) are unaffected.
function extrasBudget(bowlers) {
    const avgBWL = bowlers.reduce((sum, p) => sum + p.BWL, 0) / (bowlers.length || 1);
    return Math.max(0, Math.round(((avgBWL - 50) / 50) * 15));
}

// Splits the budget into small chunks and drops each on a random ball (balls 8-105, so
// they land mid-innings and mostly survive an early finish). Returns { ballNumber: { runs, type } }.
function scheduleExtras(total, rng) {
    const schedule = {};
    let remaining = total;
    while (remaining > 0) {
        const size = Math.min(remaining, [1, 1, 1, 2, 4][Math.floor(rng() * 5)]);
        const type =
            size === 1 ? ['wd', 'nb', 'lb'][Math.floor(rng() * 3)] : size === 4 ? 'b' : ['b', 'lb'][Math.floor(rng() * 2)];
        let ballNumber = 8 + Math.floor(rng() * 98);
        while (schedule[ballNumber]) ballNumber = 8 + Math.floor(rng() * 98);
        schedule[ballNumber] = { runs: size, type };
        remaining -= size;
    }
    return schedule;
}

function pairSynergy(a, b) {
    const combined = (a.BAT + a.POW + b.BAT + b.POW) / 4;
    return clamp(combined / 75, 0.85, 1.2);
}

/**
 * Simulates a 20-over T20 chase for an 11-player batting order (index 0 = slot 1 ... index 10 = slot 11).
 * Pure function, no DOM/React - safe to call from client components.
 */
// stopAtTarget ends the innings the moment the target is reached (a real chase) - used for a
// duel's second innings. Default false keeps solo mode and first innings playing out fully.
export function simulateChase(battingOrder, rng = Math.random, target = TARGET, difficulty = 'hard', stopAtTarget = false) {
    const config = DIFFICULTY[difficulty] || DIFFICULTY.hard;
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
    const extrasSchedule = scheduleExtras(extrasBudget(battingOrder.slice(7, 11)), rng);
    let pendingExtra = null;
    let extrasTotal = 0;
    const overSummaries = [];
    const ballLog = [];

    stats[0].dnb = false;
    stats[1].dnb = false;

    let ball = 0;
    outer: for (let over = 0; over < 20; over++) {
        let overRuns = 0;
        for (let b = 0; b < 6; b++) {
            if (wickets >= 10) break outer;
            ball++;
            if (extrasSchedule[ball]) pendingExtra = pendingExtra ? { runs: pendingExtra.runs + extrasSchedule[ball].runs, type: pendingExtra.type } : extrasSchedule[ball];

            const striker = battingOrder[strikerIdx];
            const nonStriker = battingOrder[nonStrikerIdx];
            const synergy = pairSynergy(striker, nonStriker);

            const outThisBall = rng() < dismissalChance(striker.BAT, config);
            stats[strikerIdx].balls++;

            if (outThisBall) {
                stats[strikerIdx].out = true;
                wickets++;
                totalRuns += 0;
                ballLog.push({ over, ballInOver: b + 1, batter: striker.name, runs: 0, isWicket: true, score: totalRuns, wickets });
                if (wickets >= 10 || nextInIdx > 10) break outer;
                strikerIdx = nextInIdx;
                stats[strikerIdx].dnb = false;
                nextInIdx++;
                continue;
            }

            const runs = ballRuns(striker.POW, synergy, rng, config.powerBoost);
            stats[strikerIdx].runs += runs;
            totalRuns += runs;
            overRuns += runs;
            const entry = { over, ballInOver: b + 1, batter: striker.name, runs, isWicket: false, score: totalRuns, wickets };
            // Extras ride on a normal ball (not credited to the batter) so every log entry is
            // still exactly one legal delivery. Deferred past wicket balls via pendingExtra.
            if (pendingExtra) {
                totalRuns += pendingExtra.runs;
                overRuns += pendingExtra.runs;
                extrasTotal += pendingExtra.runs;
                entry.score = totalRuns;
                entry.extras = pendingExtra.runs;
                entry.extraType = pendingExtra.type;
                pendingExtra = null;
            }
            ballLog.push(entry);

            if (stopAtTarget && totalRuns >= target) break outer;

            if (runs % 2 === 1) {
                [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
            }
        }
        overSummaries.push(overRuns);
        [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
    }

    const finalScore = totalRuns;
    const oversUsed = Math.min(20, Math.ceil(ball / 6));

    return {
        batsmen: stats,
        overSummaries,
        ballLog,
        totalRuns,
        extras: extrasTotal,
        finalScore,
        wickets,
        oversUsed,
        ballsFaced: ball,
        target,
        won: target == null ? null : finalScore >= target,
    };
}

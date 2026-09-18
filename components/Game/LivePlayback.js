'use client';

import { useEffect, useState } from 'react';

const BALL_DELAY_MS = 45;
const HIGHLIGHT_DELAY_MS = 550;
const END_PAUSE_MS = 700;

function highlightText(entry) {
    if (entry.isWicket) return `OUT! ${entry.batter} departs.`;
    if (entry.runs === 6) return `${entry.batter} — SIX!`;
    if (entry.runs === 4) return `${entry.batter} — FOUR!`;
    return `${entry.batter} — ${entry.runs} runs.`;
}

function isHighlight(entry) {
    return entry.isWicket || entry.runs >= 4;
}

// Replays the full ball-by-ball log up to `uptoIndex` to derive live state: score/wickets/
// over position (all already on the ball entries) plus who's currently at the crease and
// their runs(balls) - reconstructed from the log itself rather than tracked separately, so
// it can never drift from what simulateChase actually produced.
function computeLiveState(ballLog, uptoIndex, openers) {
    const tally = {};
    const lastSeenIdx = {};
    for (let i = 0; i <= uptoIndex; i++) {
        const entry = ballLog[i];
        if (!entry) continue;
        if (!tally[entry.batter]) tally[entry.batter] = { runs: 0, balls: 0, out: false };
        tally[entry.batter].balls++;
        if (entry.isWicket) tally[entry.batter].out = true;
        else tally[entry.batter].runs += entry.runs;
        lastSeenIdx[entry.batter] = i;
    }
    const active = Object.keys(tally)
        .filter((name) => !tally[name].out)
        .sort((a, b) => lastSeenIdx[b] - lastSeenIdx[a]);
    const last = uptoIndex >= 0 ? ballLog[uptoIndex] : null;

    const striker = active[0] || openers[0] || null;
    const nonStriker = active[1] || openers[1] || null;
    const statFor = (name) => (name && tally[name]) || { runs: 0, balls: 0, out: false };

    return {
        score: last ? last.score : 0,
        wickets: last ? last.wickets : 0,
        over: last ? last.over : 0,
        ballInOver: last ? last.ballInOver : 0,
        striker,
        nonStriker,
        strikerStats: statFor(striker),
        nonStrikerStats: statFor(nonStriker),
    };
}

export default function LivePlayback({ result, battingOrder, teamName, subtitle, inningsLabel, canSkip = true, onDone }) {
    const { ballLog } = result;
    const [ballIdx, setBallIdx] = useState(-1);
    const [ticker, setTicker] = useState([]);

    const openers = [battingOrder?.[0]?.name, battingOrder?.[1]?.name];

    useEffect(() => {
        if (ballIdx >= ballLog.length - 1) {
            const t = setTimeout(onDone, END_PAUSE_MS);
            return () => clearTimeout(t);
        }
        const nextEntry = ballLog[ballIdx + 1];
        const delay = ballIdx === -1 ? BALL_DELAY_MS : isHighlight(ballLog[ballIdx]) ? HIGHLIGHT_DELAY_MS : BALL_DELAY_MS;
        const t = setTimeout(() => {
            setBallIdx((i) => i + 1);
            if (isHighlight(nextEntry)) {
                setTicker((prev) => [nextEntry, ...prev].slice(0, 6));
            }
        }, delay);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ballIdx]);

    const live = computeLiveState(ballLog, ballIdx, openers);
    const totalOvers = 20;
    const progressPct = Math.min(100, ((ballIdx + 1) / ballLog.length) * 100);

    const ballsBowled = ballIdx + 1;
    const ballsRemaining = Math.max(0, 120 - ballsBowled);
    const runsRequired = result.target - live.score;
    const oversRemaining = ballsRemaining / 6;
    const showChaseStats = ballIdx >= 0 && ballsRemaining > 0 && live.wickets < 10 && runsRequired > 0;
    const rrr = showChaseStats ? runsRequired / oversRemaining : null;

    return (
        <div className="flex flex-col items-center gap-5 bg-surface border border-border rounded-xl p-6 sm:p-10">
            <div className="flex flex-col items-center gap-1">
                {inningsLabel && (
                    <p className="text-[11px] text-accent uppercase tracking-widest font-semibold">{inningsLabel}</p>
                )}
                <p className="text-xs text-textMuted uppercase tracking-wide">{subtitle || `${teamName} chasing ${result.target}`}</p>
                <p className="font-display text-text uppercase tracking-wide text-sm">Simulating the chase…</p>
            </div>

            <div className="flex flex-col items-center gap-1">
                <p className="font-display text-4xl sm:text-5xl text-accent tabular-nums">{live.score}/{live.wickets}</p>
                <p className="text-xs text-textMuted tabular-nums">Over {live.over}.{live.ballInOver} / {totalOvers}.0</p>
                {showChaseStats && (
                    <p className="text-xs text-accent tabular-nums mt-1">
                        Need {runsRequired} off {ballsRemaining} · RRR {rrr.toFixed(2)}
                    </p>
                )}
            </div>

            <div className="w-full max-w-md h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-accent transition-all duration-150" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="w-full max-w-md bg-bg border border-border rounded-lg p-3 flex flex-col gap-1.5">
                {live.striker && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text font-semibold truncate">{live.striker} <span className="text-accent">*</span></span>
                        <span className="text-textMuted tabular-nums shrink-0">{live.strikerStats.runs}({live.strikerStats.balls})</span>
                    </div>
                )}
                {live.nonStriker && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text truncate">{live.nonStriker}</span>
                        <span className="text-textMuted tabular-nums shrink-0">{live.nonStrikerStats.runs}({live.nonStrikerStats.balls})</span>
                    </div>
                )}
                {!live.striker && <p className="text-sm text-textMuted text-center">Openers walking out…</p>}
            </div>

            <div className="w-full max-w-md flex flex-col gap-2 min-h-[9rem]">
                {ticker.length === 0 && (
                    <p className="text-sm text-textMuted text-center">Quiet start to the chase…</p>
                )}
                {ticker.map((entry) => (
                    <p
                        key={`${entry.over}.${entry.ballInOver}`}
                        className={`text-sm text-center font-semibold ${entry.isWicket ? 'text-loss' : 'text-win'}`}
                    >
                        {entry.over}.{entry.ballInOver} — {highlightText(entry)}
                    </p>
                ))}
            </div>

            {canSkip ? (
                <button onClick={onDone} className="text-xs text-textMuted underline hover:text-text transition-colors">
                    Skip to result
                </button>
            ) : (
                <p className="text-xs text-textMuted">Watching…</p>
            )}
        </div>
    );
}

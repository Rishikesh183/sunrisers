'use client';

function ballCommentary(entry) {
    if (entry.isWicket) return `OUT! ${entry.batter} departs for ${entry.batterRuns}(${entry.batterBalls}).`;
    if (entry.runs === 0) return `${entry.batter} — no run.`;
    if (entry.runs === 4) return `${entry.batter} — FOUR!`;
    if (entry.runs === 6) return `${entry.batter} — SIX!`;
    return `${entry.batter} — ${entry.runs} run${entry.runs > 1 ? 's' : ''}.`;
}

// Single forward pass to attach each ball's batter with their cumulative runs(balls) at that
// point (for the "departs for X(Y)" line) and to snapshot the score + not-out batters at the
// end of every over (for the over-header line) - both need running tallies as the log plays
// out, which the raw ballLog doesn't carry on its own.
function annotate(ballLog) {
    const tally = {};
    const annotated = [];
    const overSnapshots = {};

    ballLog.forEach((entry, i) => {
        if (!tally[entry.batter]) tally[entry.batter] = { runs: 0, balls: 0, out: false };
        tally[entry.batter].balls++;
        if (entry.isWicket) tally[entry.batter].out = true;
        else tally[entry.batter].runs += entry.runs;

        annotated.push({ ...entry, batterRuns: tally[entry.batter].runs, batterBalls: tally[entry.batter].balls });

        const next = ballLog[i + 1];
        const isLastBallOfOver = !next || next.over !== entry.over;
        if (isLastBallOfOver) {
            const notOut = Object.entries(tally)
                .filter(([, t]) => !t.out)
                .map(([name, t]) => ({ name, runs: t.runs, balls: t.balls }));
            overSnapshots[entry.over] = { score: entry.score, wickets: entry.wickets, batters: notOut.slice(-2) };
        }
    });

    return { annotated, overSnapshots };
}

// Groups the flat ballLog into overs, newest over (and newest ball within it) first,
// matching how a live commentary feed reads.
function groupByOver(annotated) {
    const overs = [];
    for (const entry of annotated) {
        let group = overs[entry.over];
        if (!group) {
            group = { over: entry.over, balls: [] };
            overs[entry.over] = group;
        }
        group.balls.push(entry);
    }
    return overs.filter(Boolean).reverse();
}

export default function CommentaryFeed({ ballLog }) {
    const { annotated, overSnapshots } = annotate(ballLog);
    const overs = groupByOver(annotated);

    return (
        <div className="max-h-96 overflow-y-auto flex flex-col gap-4 pr-1">
            {overs.map((group) => {
                const snap = overSnapshots[group.over];
                return (
                    <div key={group.over}>
                        <div className="flex justify-between items-baseline mb-1">
                            <p className="text-xs text-textMuted uppercase tracking-wide">Over {group.over + 1}</p>
                            {snap && (
                                <p className="text-xs text-textMuted tabular-nums">
                                    {snap.score}/{snap.wickets}
                                    {snap.batters.length > 0 && (
                                        <span className="ml-2">
                                            {snap.batters.map((b) => `${b.name} ${b.runs}(${b.balls})`).join(', ')}
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col divide-y divide-border">
                            {group.balls.slice().reverse().map((entry) => (
                                <div
                                    key={entry.ballInOver}
                                    className={`flex justify-between items-center gap-2 py-1.5 text-sm ${
                                        entry.isWicket
                                            ? 'text-loss font-semibold'
                                            : entry.runs === 4 || entry.runs === 6
                                            ? 'text-accent font-semibold'
                                            : 'text-text'
                                    }`}
                                >
                                    <span className="text-textMuted text-xs w-10 shrink-0">{entry.over}.{entry.ballInOver}</span>
                                    <span className="flex-1 truncate">{ballCommentary(entry)}</span>
                                    <span className="text-textMuted text-xs shrink-0">{entry.score}/{entry.wickets}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

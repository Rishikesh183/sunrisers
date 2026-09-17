'use client';

function ballCommentary(entry) {
    if (entry.isWicket) return `OUT! ${entry.batter} departs.`;
    if (entry.runs === 0) return `${entry.batter} — no run.`;
    if (entry.runs === 4) return `${entry.batter} — FOUR!`;
    if (entry.runs === 6) return `${entry.batter} — SIX!`;
    return `${entry.batter} — ${entry.runs} run${entry.runs > 1 ? 's' : ''}.`;
}

// Groups the flat ballLog into overs, newest over (and newest ball within it) first,
// matching how a live commentary feed reads.
function groupByOver(ballLog) {
    const overs = [];
    for (const entry of ballLog) {
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
    const overs = groupByOver(ballLog);

    return (
        <div className="max-h-96 overflow-y-auto flex flex-col gap-4 pr-1">
            {overs.map((group) => (
                <div key={group.over}>
                    <p className="text-xs text-textMuted uppercase tracking-wide mb-1">Over {group.over + 1}</p>
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
            ))}
        </div>
    );
}

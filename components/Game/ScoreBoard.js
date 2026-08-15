'use client';

import { slotLabel } from '../../lib/game/positions';

export default function ScoreBoard({ battingOrder, result, bestScore, onPlayAgain }) {
    return (
        <div className="flex flex-col gap-5">
            <div className={`rounded-xl border p-5 sm:p-6 text-center ${result.won ? 'border-win bg-win/10' : 'border-loss bg-loss/10'}`}>
                <p className="text-sm text-textMuted uppercase tracking-wide mb-1">Final Score</p>
                <p className={`font-display text-4xl sm:text-5xl ${result.won ? 'text-win' : 'text-loss'}`}>
                    {result.finalScore}/{result.wickets} <span className="text-lg text-textMuted">({result.oversUsed} ov)</span>
                </p>
                <p className="mt-2 font-semibold text-text">
                    {result.won
                        ? `Impossible? Not for this XI. ${result.target} chased down.`
                        : `Fell short of the ${result.target} par score.`}
                </p>
                {result.moraleBonus !== 0 && (
                    <p className="text-xs text-textMuted mt-1">
                        {result.moraleBonus > 0 ? '+' : ''}{result.moraleBonus} bowler-morale bonus applied
                    </p>
                )}
                {bestScore != null && (
                    <p className="text-xs text-textMuted mt-2">Your best: {bestScore}/300</p>
                )}
            </div>

            <div className="bg-surface border border-border rounded-xl p-3 sm:p-5">
                <h3 className="font-display text-text mb-3 uppercase tracking-wide text-sm">Scorecard</h3>
                <div className="flex flex-col divide-y divide-border">
                    {result.batsmen.map((b, i) => (
                        <div key={i} className="flex justify-between items-center py-2 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-textMuted text-xs w-16 shrink-0">#{i + 1} {slotLabel(i + 1)}</span>
                                <span className="text-text truncate">{battingOrder[i].name}</span>
                            </div>
                            <span className="text-textMuted shrink-0">
                                {b.dnb ? 'DNB' : `${b.runs}(${b.balls})${b.out ? '' : '*'}`}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onPlayAgain}
                    className="py-2 px-5 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
}

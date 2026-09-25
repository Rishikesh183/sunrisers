'use client';

import { useEffect, useState } from 'react';
import LivePlayback from '../Game/LivePlayback';
import ScoreBoard from '../Game/ScoreBoard';

const TARGET_REVEAL_MS = 2200;

export default function DuelResult({ room, myUid }) {
    const [stage, setStage] = useState('first'); // 'first' | 'targetReveal' | 'second' | 'final'

    const isHostFirst = room.firstPickerUid === room.hostUid;
    const firstUid = room.firstPickerUid;
    const secondUid = isHostFirst ? room.guestUid : room.hostUid;
    const firstName = isHostFirst ? room.hostName : room.guestName;
    const secondName = isHostFirst ? room.guestName : room.hostName;
    const firstTeam = isHostFirst ? room.hostTeam : room.guestTeam;
    const secondTeam = isHostFirst ? room.guestTeam : room.hostTeam;
    const firstResult = isHostFirst ? room.resultHost : room.resultGuest;
    const secondResult = isHostFirst ? room.resultGuest : room.resultHost;

    const firstOpeners = firstResult.batsmen.slice(0, 2).map((b) => ({ name: b.name }));
    const secondOpeners = secondResult.batsmen.slice(0, 2).map((b) => ({ name: b.name }));
    const firstOrder = firstResult.batsmen.map((b) => ({ name: b.name }));
    const secondOrder = secondResult.batsmen.map((b) => ({ name: b.name }));

    const matchup = `${firstName}'s ${firstTeam} vs ${secondName}'s ${secondTeam}`;
    const target = firstResult.finalScore + 1;

    useEffect(() => {
        if (stage !== 'targetReveal') return;
        const t = setTimeout(() => setStage('second'), TARGET_REVEAL_MS);
        return () => clearTimeout(t);
    }, [stage]);

    if (stage === 'first') {
        return (
            <LivePlayback
                result={firstResult}
                battingOrder={firstOpeners}
                inningsLabel="First Innings"
                subtitle={`${firstName}'s ${firstTeam} — batting first`}
                canSkip={myUid === firstUid}
                onDone={() => setStage('targetReveal')}
            />
        );
    }

    if (stage === 'targetReveal') {
        return (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="text-xs text-textMuted uppercase tracking-wide">{matchup}</p>
                <p className="font-display text-text text-lg">
                    {firstName} posted <span className="text-accent">{firstResult.finalScore}/{firstResult.wickets}</span>
                </p>
                <p className="text-sm text-textMuted text-center">
                    Target for {secondName}'s innings is <span className="text-accent font-semibold">{target}</span>.
                </p>
            </div>
        );
    }

    if (stage === 'second') {
        return (
            <LivePlayback
                result={secondResult}
                battingOrder={secondOpeners}
                inningsLabel="Second Innings"
                subtitle={`${secondName}'s ${secondTeam} — bowling first, now chasing ${target}`}
                canSkip={myUid === secondUid}
                onDone={() => setStage('final')}
            />
        );
    }

    const winnerName = room.winnerUid === firstUid ? firstName : secondName;
    const secondWon = room.winnerUid === secondUid;
    const marginText = secondWon
        ? `${secondName} won by ${10 - secondResult.wickets} wicket${10 - secondResult.wickets === 1 ? '' : 's'}`
        : `${firstName} won by ${firstResult.finalScore - secondResult.finalScore} run${firstResult.finalScore - secondResult.finalScore === 1 ? '' : 's'}`;

    // firstResult.won reflects "beat the 300 baseline", not the duel outcome (only
    // secondResult.won IS the duel outcome, since the second side's target is the first side's
    // score) - override so the first side's scorecard color/copy matches who actually won.
    const firstDisplayResult = { ...firstResult, won: room.winnerUid === firstUid };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="text-xs text-textMuted uppercase tracking-wide">{matchup}</p>
                <p className="font-display text-accent uppercase tracking-wide text-lg">{winnerName} wins!</p>
                <p className="text-sm text-textMuted">{marginText}</p>
                <div className="w-full max-w-sm flex flex-col gap-3 mt-2">
                    <div className={`flex justify-between items-center rounded-lg border p-3 ${room.winnerUid === firstUid ? 'border-win bg-win/10' : 'border-border'}`}>
                        <span className="text-text font-semibold">{firstName}</span>
                        <span className="font-display text-text tabular-nums">{firstResult.finalScore}/{firstResult.wickets}</span>
                    </div>
                    <div className={`flex justify-between items-center rounded-lg border p-3 ${room.winnerUid === secondUid ? 'border-win bg-win/10' : 'border-border'}`}>
                        <span className="text-text font-semibold">{secondName}</span>
                        <span className="font-display text-text tabular-nums">{secondResult.finalScore}/{secondResult.wickets}</span>
                    </div>
                </div>
            </div>

            <div>
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{firstName}'s innings</p>
                <ScoreBoard
                    battingOrder={firstOrder}
                    result={firstDisplayResult}
                    resultText={`Set a target of ${firstResult.finalScore}.`}
                />
            </div>

            <div>
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{secondName}'s innings</p>
                <ScoreBoard
                    battingOrder={secondOrder}
                    result={secondResult}
                    resultText={
                        secondResult.won
                            ? `Chased down ${firstResult.finalScore} to win.`
                            : `Fell short of the ${firstResult.finalScore} target.`
                    }
                />
            </div>
        </div>
    );
}

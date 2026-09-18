'use client';

import { useEffect, useState } from 'react';
import LivePlayback from '../Game/LivePlayback';
import ScoreBoard from '../Game/ScoreBoard';

const TARGET_REVEAL_MS = 2200;

function marginText(room) {
    const guestWon = room.winnerUid === room.guestUid;
    if (guestWon) {
        const wicketsInHand = 10 - room.resultGuest.wickets;
        return `${room.guestName} won by ${wicketsInHand} wicket${wicketsInHand === 1 ? '' : 's'}`;
    }
    const runMargin = room.resultHost.finalScore - room.resultGuest.finalScore;
    return `${room.hostName} won by ${runMargin} run${runMargin === 1 ? '' : 's'}`;
}

export default function DuelResult({ room, myUid }) {
    const [stage, setStage] = useState('host'); // 'host' | 'targetReveal' | 'guest' | 'final'

    const hostOpeners = room.resultHost.batsmen.slice(0, 2).map((b) => ({ name: b.name }));
    const guestOpeners = room.resultGuest.batsmen.slice(0, 2).map((b) => ({ name: b.name }));
    const hostOrder = room.resultHost.batsmen.map((b) => ({ name: b.name }));
    const guestOrder = room.resultGuest.batsmen.map((b) => ({ name: b.name }));

    const matchup = `${room.hostName}'s ${room.team} vs ${room.guestName}'s ${room.team}`;
    const target = room.resultHost.finalScore + 1;

    useEffect(() => {
        if (stage !== 'targetReveal') return;
        const t = setTimeout(() => setStage('guest'), TARGET_REVEAL_MS);
        return () => clearTimeout(t);
    }, [stage]);

    if (stage === 'host') {
        return (
            <LivePlayback
                result={room.resultHost}
                battingOrder={hostOpeners}
                inningsLabel="First Innings"
                subtitle={`${room.hostName}'s ${room.team}`}
                canSkip={myUid === room.hostUid}
                onDone={() => setStage('targetReveal')}
            />
        );
    }

    if (stage === 'targetReveal') {
        return (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="text-xs text-textMuted uppercase tracking-wide">{matchup}</p>
                <p className="font-display text-text text-lg">
                    {room.hostName} posted <span className="text-accent">{room.resultHost.finalScore}/{room.resultHost.wickets}</span>
                </p>
                <p className="text-sm text-textMuted text-center">
                    Target for {room.guestName}'s innings is <span className="text-accent font-semibold">{target}</span>.
                </p>
            </div>
        );
    }

    if (stage === 'guest') {
        return (
            <LivePlayback
                result={room.resultGuest}
                battingOrder={guestOpeners}
                inningsLabel="Second Innings"
                subtitle={`${room.guestName}'s ${room.team} — target ${target}`}
                canSkip={myUid === room.guestUid}
                onDone={() => setStage('final')}
            />
        );
    }

    const winnerName = room.winnerUid === room.hostUid ? room.hostName : room.guestName;
    // resultHost.won reflects "beat the 300 baseline", not the duel outcome (only
    // resultGuest.won IS the duel outcome, since the guest's target is the host's score) -
    // override so the host's scorecard color/copy matches who actually won the duel.
    const hostDisplayResult = { ...room.resultHost, won: room.winnerUid === room.hostUid };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="text-xs text-textMuted uppercase tracking-wide">{matchup}</p>
                <p className="font-display text-accent uppercase tracking-wide text-lg">{winnerName} wins!</p>
                <p className="text-sm text-textMuted">{marginText(room)}</p>
                <div className="w-full max-w-sm flex flex-col gap-3 mt-2">
                    <div className={`flex justify-between items-center rounded-lg border p-3 ${room.winnerUid === room.hostUid ? 'border-win bg-win/10' : 'border-border'}`}>
                        <span className="text-text font-semibold">{room.hostName}</span>
                        <span className="font-display text-text tabular-nums">{room.resultHost.finalScore}/{room.resultHost.wickets}</span>
                    </div>
                    <div className={`flex justify-between items-center rounded-lg border p-3 ${room.winnerUid === room.guestUid ? 'border-win bg-win/10' : 'border-border'}`}>
                        <span className="text-text font-semibold">{room.guestName}</span>
                        <span className="font-display text-text tabular-nums">{room.resultGuest.finalScore}/{room.resultGuest.wickets}</span>
                    </div>
                </div>
            </div>

            <div>
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{room.hostName}'s innings</p>
                <ScoreBoard
                    battingOrder={hostOrder}
                    result={hostDisplayResult}
                    resultText={`Set a target of ${room.resultHost.finalScore}.`}
                />
            </div>

            <div>
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{room.guestName}'s innings</p>
                <ScoreBoard
                    battingOrder={guestOrder}
                    result={room.resultGuest}
                    resultText={
                        room.resultGuest.won
                            ? `Chased down ${room.resultHost.finalScore} to win.`
                            : `Fell short of the ${room.resultHost.finalScore} target.`
                    }
                />
            </div>
        </div>
    );
}

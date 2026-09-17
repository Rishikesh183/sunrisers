'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { getDuelHistory } from '../../lib/data/duelResults';

function formatDate(timestamp) {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function DuelHistory({ uid }) {
    const [history, setHistory] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDuelHistory(uid)
            .then(setHistory)
            .catch((err) => setError(err.message));
    }, [uid]);

    if (error) return <p className="text-sm text-loss text-center">Couldn't load duel history: {error}</p>;
    if (history === null) return <p className="text-sm text-textMuted text-center">Loading…</p>;
    if (history.length === 0) return <p className="text-sm text-textMuted text-center py-6">No duels played yet.</p>;

    return (
        <div className="flex flex-col divide-y divide-border">
            {history.map((duel) => {
                const won = duel.winnerUid === uid;
                const isHost = duel.hostUid === uid;
                const myScore = isHost ? duel.hostScore : duel.guestScore;
                const opponentScore = isHost ? duel.guestScore : duel.hostScore;

                return (
                    <div key={duel.id} className="flex justify-between items-center gap-3 py-3">
                        <div className="min-w-0">
                            <p className={`font-semibold ${won ? 'text-win' : 'text-loss'}`}>{won ? 'Won' : 'Lost'} · {duel.team}</p>
                            <p className="text-xs text-textMuted">{formatDate(duel.completedAt)}</p>
                        </div>
                        <p className="text-text tabular-nums shrink-0">{myScore} – {opponentScore}</p>
                    </div>
                );
            })}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useUser();

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-10 bg-bg min-h-screen">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-text text-center uppercase tracking-wide mb-6">
                Dashboard
            </h1>

            <SignedOut>
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">Sign in to see your duel history.</p>
                    <Link
                        href="/signin"
                        className="py-2 px-6 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                    >
                        Sign In
                    </Link>
                </div>
            </SignedOut>

            <SignedIn>
                <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
                    <h2 className="font-display text-text uppercase tracking-wide text-sm mb-4">1v1 Duel History</h2>
                    {user && <DuelHistory uid={user.id} />}
                </div>
            </SignedIn>
        </div>
    );
}

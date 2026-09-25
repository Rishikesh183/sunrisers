'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import OpponentList from '../../../components/Duel/OpponentList';
import { createRoom } from '../../../lib/duel/room';
import { getTeams } from '../../../lib/data/seasonSquads';

export default function DuelLobby() {
    const { user } = useUser();
    const router = useRouter();
    const teams = getTeams();
    const [team, setTeam] = useState(teams[0]?.code || '');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    async function handleChallenge(opponent) {
        if (!user || creating) return;
        setCreating(true);
        setError(null);
        try {
            const roomId = await createRoom({
                hostUid: user.id,
                hostName: user.fullName || user.username || 'Player',
                hostTeam: team,
                opponentUid: opponent.uid,
                opponentName: opponent.displayName,
            });
            router.push(`/300par/duel/${roomId}`);
        } catch (err) {
            setError(err.message);
            setCreating(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-10 bg-bg min-h-screen">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-text text-center uppercase tracking-wide mb-2">
                1v1 Duel
            </h1>
            <p className="text-center text-textMuted text-sm sm:text-base mb-6 max-w-xl mx-auto">
                Pick a franchise and an opponent, draft against each other turn by turn, then compare chases.
                Sign in required so results can be saved to your dashboard.
            </p>

            <SignedOut>
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">Sign in to challenge another player.</p>
                    <Link
                        href="/signin"
                        className="py-2 px-6 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                    >
                        Sign In
                    </Link>
                </div>
            </SignedOut>

            <SignedIn>
                <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-textMuted uppercase tracking-wide shrink-0">Franchise</label>
                        <select
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className="form-select bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text flex-1"
                        >
                            {teams.map((t) => (
                                <option key={t.code} value={t.code}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <h2 className="font-display text-text uppercase tracking-wide text-sm">Choose an opponent</h2>
                    {user && <OpponentList currentUid={user.id} onChallenge={handleChallenge} />}
                    {creating && <p className="text-xs text-textMuted text-center">Creating room…</p>}
                    {error && <p className="text-xs text-loss text-center">{error}</p>}
                </div>
            </SignedIn>
        </div>
    );
}

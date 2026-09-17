'use client';

import { useEffect, useMemo, useState } from 'react';
import { getOpponentCandidates } from '../../lib/data/users';

const DEBOUNCE_MS = 200;

// Debounces the input purely for render smoothness - the underlying candidate list was already
// fetched once (see lib/data/users.js), so every keystroke filters in-memory with zero extra reads.
function useDebouncedValue(value, delayMs) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

export default function OpponentList({ currentUid, onChallenge }) {
    const [candidates, setCandidates] = useState(null);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

    useEffect(() => {
        let cancelled = false;
        getOpponentCandidates()
            .then((users) => {
                if (!cancelled) setCandidates(users);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const opponents = useMemo(() => {
        const others = (candidates || []).filter((u) => u.uid !== currentUid);
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return others;
        return others.filter((u) => u.displayNameLower?.includes(q) || u.displayName?.toLowerCase().includes(q));
    }, [candidates, debouncedQuery, currentUid]);

    if (error) {
        return <p className="text-sm text-loss text-center">Couldn't load opponents: {error}</p>;
    }

    if (candidates === null) {
        return <p className="text-sm text-textMuted text-center">Loading opponents…</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name…"
                className="bg-surface border border-border rounded-lg px-4 py-2 text-text placeholder:text-textMuted focus:outline-none focus:border-accent"
            />

            {opponents.length === 0 && (
                <p className="text-sm text-textMuted text-center py-6">
                    {candidates.length <= 1 ? 'No other players have signed up yet.' : 'No matches found.'}
                </p>
            )}

            <div className="flex flex-col divide-y divide-border">
                {opponents.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-accentMuted text-accent font-display flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (user.displayName || '?').slice(0, 2).toUpperCase()
                                )}
                            </div>
                            <span className="text-text truncate">{user.displayName}</span>
                        </div>
                        <button
                            onClick={() => onChallenge(user)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accentHover transition-colors font-semibold shrink-0"
                        >
                            Challenge
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

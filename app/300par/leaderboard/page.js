'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { getLeaderboard } from '../../../lib/data/leaderboard';
import { friendlyError } from '../../../lib/firebaseErrors';
import { TEAMS } from '../../../data/teams';
import Spinner from '../../../components/Duel/Spinner';

const RANGES = [
    { key: 'today', label: 'Today' },
    { key: 'all', label: 'All time' },
];
const SORTS = [
    { key: 'score', label: 'Highest score' },
    { key: 'count', label: 'Most 300s' },
];
const DIFFICULTIES = [
    { key: 'hard', label: 'Hard' },
    { key: 'easy', label: 'Easy' },
];

const teamColor = (code) => TEAMS.find((t) => t.code === code)?.color || '#8b96a8';
const formatOvers = (balls) => (balls == null ? '' : `${Math.floor(balls / 6)}.${balls % 6}`);

function Tabs({ options, value, onChange }) {
    return (
        <div className="inline-flex rounded-xl border border-white/15 bg-bg/60 p-1">
            {options.map((o) => (
                <button
                    key={o.key}
                    type="button"
                    onClick={() => onChange(o.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                        value === o.key ? 'bg-accent text-white' : 'text-white/80 hover:text-white'
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

export default function LeaderboardPage() {
    const { user } = useUser();
    const [range, setRange] = useState('today');
    const [sort, setSort] = useState('score');
    const [difficulty, setDifficulty] = useState('hard');
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(null);
    // Each view is fetched at most once per visit; flipping between tabs re-uses the result.
    const cache = useRef(new Map());

    useEffect(() => {
        const key = `${range}|${sort}|${difficulty}`;
        setError(null);
        if (cache.current.has(key)) {
            setRows(cache.current.get(key));
            return;
        }
        setRows(null);
        let cancelled = false;
        getLeaderboard({ range, sort, difficulty })
            .then((list) => {
                cache.current.set(key, list);
                if (!cancelled) setRows(list);
            })
            .catch((err) => !cancelled && setError(friendlyError(err)));
        return () => {
            cancelled = true;
        };
    }, [range, sort, difficulty]);

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-10 bg-bg min-h-screen">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-text text-center uppercase tracking-wide mb-1">
                300 Par Leaderboard
            </h1>
            <p className="text-center text-text/70 text-sm mb-5">
                Only runs of 300 or more make the board. Sign in after a 300+ to claim your spot.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
                <Tabs options={RANGES} value={range} onChange={setRange} />
                <Tabs options={SORTS} value={sort} onChange={setSort} />
                <Tabs options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
            </div>

            <div className="bg-surface border border-border rounded-2xl p-3 sm:p-5">
                {error && <p className="text-sm text-loss text-center py-6">Couldn&apos;t load the leaderboard: {error}</p>}
                {!error && rows === null && (
                    <div className="py-8 flex justify-center">
                        <Spinner label="Loading…" className="text-sm text-text/70" />
                    </div>
                )}
                {!error && rows && rows.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-text/80 text-sm">
                            {range === 'today' ? 'Nobody has hit 300 today yet.' : 'No 300s on the board yet.'} Be the first!
                        </p>
                        <Link href="/300par" className="inline-block mt-3 text-accent font-semibold underline">Play 300 Par</Link>
                    </div>
                )}
                {!error && rows && rows.length > 0 && (
                    <ol className="divide-y divide-border">
                        {rows.map((r, i) => {
                            const mine = user?.id === r.uid;
                            return (
                                <li key={r.uid} className={`flex items-center gap-3 py-3 ${mine ? 'bg-accentMuted -mx-2 px-2 rounded-lg' : ''}`}>
                                    <span className={`w-7 text-center font-display ${i < 3 ? 'text-accent text-lg' : 'text-text/70'}`}>{i + 1}</span>
                                    <span className="w-1.5 h-9 rounded-full shrink-0" style={{ background: teamColor(r.team) }} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {r.name}
                                            {mine && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-accent">you</span>}
                                        </p>
                                        <p className="text-xs text-text/70">
                                            {r.team} · {r.bestScore}/{r.bestWickets} ({formatOvers(r.bestBalls)} ov)
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {sort === 'count' ? (
                                            <>
                                                <p className="font-display text-xl text-white tabular-nums">{r.count300}</p>
                                                <p className="text-[10px] uppercase tracking-wide text-text/60">300s</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-display text-xl text-white tabular-nums">{r.bestScore}</p>
                                                <p className="text-[10px] uppercase tracking-wide text-text/60">{r.count300} × 300+</p>
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>
        </div>
    );
}

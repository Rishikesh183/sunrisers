'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { getDuelHistory } from '../../lib/data/duelResults';
import { getDisplayNames } from '../../lib/data/users';
import { friendlyError } from '../../lib/firebaseErrors';
import { TEAMS } from '../../data/teams';

function formatDate(timestamp) {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatOvers(balls) {
    if (balls == null) return null;
    return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function teamColor(code) {
    return TEAMS.find((t) => t.code === code)?.color || '#8b96a8';
}

// Normalises a stored duel doc into two innings rows from the viewer's perspective. Older docs
// (saved before wickets/names/batting-order were stored) just lack those fields - every extra
// is optional so they still render as a plain score line.
function describeDuel(duel, uid, names = {}) {
    const isHost = duel.hostUid === uid;
    const side = (host) => {
        const sideUid = host ? duel.hostUid : duel.guestUid;
        return {
            uid: sideUid,
            name: names[sideUid] || (host ? duel.hostName : duel.guestName) || (sideUid === uid ? 'You' : 'Opponent'),
            team: (host ? duel.hostTeam : duel.guestTeam) || duel.team,
            score: host ? duel.hostScore : duel.guestScore,
            wickets: host ? duel.hostWickets : duel.guestWickets,
            balls: host ? duel.hostBalls : duel.guestBalls,
        };
    };
    const host = side(true);
    const guest = side(false);

    const hasOrder = duel.battedFirstUid != null;
    const [first, second] = hasOrder && duel.battedFirstUid === guest.uid ? [guest, host] : [host, guest];
    const winnerIsSecond = duel.winnerUid === second.uid;

    let margin = null;
    if (hasOrder && second.wickets != null) {
        if (winnerIsSecond) {
            const left = 10 - second.wickets;
            margin = `${second.name} won by ${left} wicket${left === 1 ? '' : 's'}`;
        } else {
            const runs = first.score - second.score;
            margin = `${first.name} won by ${runs} run${runs === 1 ? '' : 's'}`;
        }
    } else {
        margin = `${duel.winnerUid === host.uid ? host.name : guest.name} won`;
    }

    return { won: duel.winnerUid === uid, me: isHost ? host : guest, rows: [first, second], hasOrder, margin };
}

function InningsRow({ row, isWinner, isMe, label }) {
    const overs = formatOvers(row.balls);
    return (
        <div className={`flex items-center justify-between gap-3 py-2 ${isWinner ? '' : 'opacity-80'}`}>
            <div className="flex items-center gap-3 min-w-0">
                <span
                    className="shrink-0 w-10 h-7 rounded-md flex items-center justify-center text-[11px] font-display text-white"
                    style={{ backgroundColor: teamColor(row.team) }}
                >
                    {row.team}
                </span>
                <div className="min-w-0">
                    <p className={`truncate text-sm ${isWinner ? 'font-bold text-text' : 'font-medium text-textMuted'}`}>
                        {row.name}
                        {isMe && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-accent">you</span>}
                    </p>
                    {label && <p className="text-[10px] uppercase tracking-wide text-textMuted">{label}</p>}
                </div>
            </div>
            <p className={`tabular-nums shrink-0 ${isWinner ? 'font-bold text-text' : 'text-textMuted'}`}>
                <span className="text-base">{row.score}{row.wickets != null && `/${row.wickets}`}</span>
                {overs && <span className="ml-1.5 text-xs font-normal text-textMuted">({overs})</span>}
            </p>
        </div>
    );
}

function DuelCard({ duel, uid, names }) {
    const { won, me, rows, hasOrder, margin } = describeDuel(duel, uid, names);
    return (
        <div className="bg-bg border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
                <p className="text-[11px] uppercase tracking-wide text-textMuted">1v1 Duel · {formatDate(duel.completedAt)}</p>
                <span
                    className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                        won ? 'bg-win/15 text-win' : 'bg-loss/15 text-loss'
                    }`}
                >
                    {won ? 'Won' : 'Lost'}
                </span>
            </div>
            <div className="px-4 divide-y divide-border">
                {rows.map((row, i) => (
                    <InningsRow
                        key={row.uid}
                        row={row}
                        isWinner={duel.winnerUid === row.uid}
                        isMe={row.uid === me.uid}
                        label={hasOrder ? (i === 0 ? '1st innings' : '2nd innings') : null}
                    />
                ))}
            </div>
            <p className={`px-4 py-2.5 text-sm font-semibold border-t border-border ${won ? 'text-win' : 'text-loss'}`}>
                {margin}
            </p>
        </div>
    );
}

function SummaryStrip({ history, uid }) {
    const won = history.filter((d) => d.winnerUid === uid).length;
    const played = history.length;
    const pct = played ? Math.round((won / played) * 100) : 0;
    const stats = [
        { label: 'Played', value: played },
        { label: 'Won', value: won },
        { label: 'Lost', value: played - won },
        { label: 'Win %', value: `${pct}%` },
    ];
    return (
        <div className="grid grid-cols-4 gap-2 mb-5">
            {stats.map((s) => (
                <div key={s.label} className="bg-bg border border-border rounded-lg py-3 text-center">
                    <p className="font-display text-xl text-text tabular-nums">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-textMuted">{s.label}</p>
                </div>
            ))}
        </div>
    );
}

function DuelHistory({ uid }) {
    const [history, setHistory] = useState(null);
    const [names, setNames] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        getDuelHistory(uid)
            .then((list) => {
                setHistory(list);
                // Show players' current usernames rather than whatever name was saved with the duel.
                getDisplayNames(list.flatMap((d) => [d.hostUid, d.guestUid])).then(setNames);
            })
            .catch((err) => setError(friendlyError(err)));
    }, [uid]);

    if (error) return <p className="text-sm text-loss text-center">Couldn't load duel history: {error}</p>;
    if (history === null) return <p className="text-sm text-textMuted text-center">Loading…</p>;
    if (history.length === 0) return <p className="text-sm text-textMuted text-center py-6">No duels played yet.</p>;

    return (
        <>
            <SummaryStrip history={history} uid={uid} />
            <div className="flex flex-col gap-3">
                {history.map((duel) => (
                    <DuelCard key={duel.id} duel={duel} uid={uid} names={names} />
                ))}
            </div>
        </>
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

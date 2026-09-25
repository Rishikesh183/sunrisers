'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import {
    subscribeToRoom,
    subscribeToPicks,
    joinRoom,
    chooseFirstPicker,
    submitPick,
    finalizeResult,
    closeRoom,
    isRoomExpired,
    ROOM_TTL_MS,
} from '../../../../lib/duel/room';
import { getSeasonSquads, getTeams } from '../../../../lib/data/seasonSquads';
import { simulateChase } from '../../../../lib/game/simulate';
import { TOTAL_SLOTS } from '../../../../lib/game/positions';
import { TEAMS } from '../../../../data/teams';
import TossPanel from '../../../../components/Duel/TossPanel';
import DuelDraftBoard from '../../../../components/Duel/DuelDraftBoard';
import DuelResult from '../../../../components/Duel/DuelResult';

function buildBattingOrder(picks, uid, seasonSquads) {
    const bySlot = {};
    for (const pick of picks) {
        if (pick.uid !== uid) continue;
        const player = (seasonSquads[String(pick.year)] || []).find((p) => p.name === pick.playerName);
        if (player) bySlot[pick.slot] = player;
    }
    return Array.from({ length: TOTAL_SLOTS }, (_, i) => bySlot[i + 1]).filter(Boolean);
}

function teamName(code) {
    return TEAMS.find((t) => t.code === code)?.name || code;
}

export default function DuelRoomPage({ params }) {
    const { roomId } = params;
    const { user, isSignedIn, isLoaded } = useUser();
    const [room, setRoom] = useState(undefined); // undefined = loading, null = not found
    const [picks, setPicks] = useState([]);
    const [actionError, setActionError] = useState(null);
    const [guestTeamChoice, setGuestTeamChoice] = useState(null);
    const [copied, setCopied] = useState(false);
    const [closing, setClosing] = useState(false);
    const simulateAttempted = useRef(false);
    const teams = getTeams();

    useEffect(() => {
        const unsubRoom = subscribeToRoom(roomId, setRoom);
        const unsubPicks = subscribeToPicks(roomId, setPicks);
        return () => {
            unsubRoom();
            unsubPicks();
        };
    }, [roomId]);

    useEffect(() => {
        if (room && room.hostTeam && guestTeamChoice === null) {
            setGuestTeamChoice(room.hostTeam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.hostTeam]);

    const myUid = user?.id;
    const hostSeasonSquads = room ? getSeasonSquads(room.hostTeam) : {};
    const guestSeasonSquads = room && room.guestTeam ? getSeasonSquads(room.guestTeam) : {};
    const myTeamCode = room ? (myUid === room.hostUid ? room.hostTeam : room.guestTeam) : null;
    const teamInfo = TEAMS.find((t) => t.code === (myTeamCode || room?.hostTeam));
    const themeStyle = teamInfo
        ? { '--accent': teamInfo.color, '--accent-hover': teamInfo.colorHover, '--accent-muted': teamInfo.colorMuted }
        : undefined;

    useEffect(() => {
        if (!room || room.status !== 'simulating' || simulateAttempted.current) return;
        simulateAttempted.current = true;

        // Whoever won the toss and chose to draft first also bats first here - the two are the
        // same decision, not independently host-vs-guest (a real bug this fixes: it used to
        // always simulate the host's innings first regardless of who actually picked first).
        const firstUid = room.firstPickerUid;
        const isHostFirst = firstUid === room.hostUid;
        const secondUid = isHostFirst ? room.guestUid : room.hostUid;
        const firstSeasonSquads = isHostFirst ? hostSeasonSquads : guestSeasonSquads;
        const secondSeasonSquads = isHostFirst ? guestSeasonSquads : hostSeasonSquads;

        const firstOrder = buildBattingOrder(picks, firstUid, firstSeasonSquads);
        const secondOrder = buildBattingOrder(picks, secondUid, secondSeasonSquads);
        const firstResult = simulateChase(firstOrder);
        const secondResult = simulateChase(secondOrder, Math.random, firstResult.finalScore);
        const winnerUid = secondResult.won ? secondUid : firstUid;

        const hostResult = isHostFirst ? firstResult : secondResult;
        const guestResult = isHostFirst ? secondResult : firstResult;

        finalizeResult(roomId, {
            hostResult,
            guestResult,
            winnerUid,
            hostUid: room.hostUid,
            guestUid: room.guestUid,
            hostTeam: room.hostTeam,
            guestTeam: room.guestTeam,
        }).catch((err) => setActionError(err.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.status]);

    async function handleJoin() {
        try {
            await joinRoom(roomId, {
                guestUid: myUid,
                guestName: user.fullName || user.username || 'Player',
                guestTeam: guestTeamChoice || room.hostTeam,
            });
        } catch (err) {
            setActionError(err.message);
        }
    }

    async function handleChooseFirstPicker(uid) {
        try {
            await chooseFirstPicker(roomId, uid);
        } catch (err) {
            setActionError(err.message);
        }
    }

    async function handleSubmitPick(payload) {
        try {
            await submitPick(roomId, payload);
        } catch (err) {
            setActionError(err.message);
        }
    }

    async function handleCloseRoom() {
        setClosing(true);
        try {
            await closeRoom(roomId, myUid);
        } catch (err) {
            setActionError(err.message);
            setClosing(false);
        }
    }

    function handleCopyLink() {
        const link = typeof window !== 'undefined' ? window.location.href : '';
        navigator.clipboard?.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    let body;

    if (!isLoaded || room === undefined) {
        body = <p className="text-sm text-textMuted text-center">Loading room…</p>;
    } else if (room === null) {
        body = <p className="text-sm text-loss text-center">This room doesn't exist.</p>;
    } else if (room.status === 'closed') {
        body = (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="text-text text-center">This invite was closed by the host.</p>
                <Link href="/300par/duel" className="text-accent text-sm underline">Start a new duel</Link>
            </div>
        );
    } else if (room.status === 'waiting' && isRoomExpired(room)) {
        body = <p className="text-sm text-loss text-center">This invite has expired (invites last {ROOM_TTL_MS / 60000} minutes).</p>;
    } else if (room.status === 'waiting') {
        const link = typeof window !== 'undefined' ? window.location.href : '';
        body =
            myUid === room.hostUid ? (
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">
                        This is the link to play with <span className="text-accent font-semibold">{room.opponentName || 'your opponent'}</span>. Share it to start.
                    </p>
                    <div className="flex w-full max-w-md gap-2">
                        <input
                            readOnly
                            value={link}
                            onFocus={(e) => e.target.select()}
                            className="flex-1 min-w-0 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-textMuted"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="shrink-0 text-xs px-3 py-2 rounded-lg bg-accent hover:bg-accentHover text-white font-semibold transition-colors"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <button
                        onClick={handleCloseRoom}
                        disabled={closing}
                        className="text-xs text-loss underline hover:text-loss/80 transition-colors disabled:opacity-40"
                    >
                        {closing ? 'Closing…' : 'Close this invite'}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">
                        {room.hostName} has challenged you to a 300 Par duel — {room.hostName} picked {teamName(room.hostTeam)}.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-textMuted">
                        Your franchise:
                        <select
                            value={guestTeamChoice || room.hostTeam}
                            onChange={(e) => setGuestTeamChoice(e.target.value)}
                            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text"
                        >
                            {teams.map((t) => (
                                <option key={t.code} value={t.code}>{t.name}</option>
                            ))}
                        </select>
                    </label>
                    <button
                        onClick={handleJoin}
                        className="py-2 px-6 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                    >
                        Join Duel
                    </button>
                </div>
            );
    } else if (room.status === 'toss') {
        body = <TossPanel room={room} myUid={myUid} onChoose={handleChooseFirstPicker} />;
    } else if (room.status === 'drafting') {
        body = (
            <DuelDraftBoard
                room={room}
                myUid={myUid}
                hostSeasonSquads={hostSeasonSquads}
                guestSeasonSquads={guestSeasonSquads}
                picks={picks}
                onSubmitPick={handleSubmitPick}
            />
        );
    } else if (room.status === 'simulating') {
        body = <p className="text-sm text-textMuted text-center">Both squads are set — simulating the duel…</p>;
    } else if (room.status === 'complete') {
        body = <DuelResult room={room} myUid={myUid} />;
    }

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-10 bg-bg min-h-screen" style={themeStyle}>
            <h1 className="text-2xl sm:text-3xl font-display text-text text-center uppercase tracking-wide mb-2">
                300 Par · 1v1 Duel
            </h1>
            {room && room.hostName && room.guestName && (
                <p className="text-sm text-textMuted text-center mb-6">
                    {room.hostName}'s {room.hostTeam} vs {room.guestName}'s {room.guestTeam}
                </p>
            )}

            <SignedOut>
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">Sign in to join this duel.</p>
                    <Link
                        href={`/signin?redirect_url=/300par/duel/${roomId}`}
                        className="py-2 px-6 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                    >
                        Sign In
                    </Link>
                </div>
            </SignedOut>

            <SignedIn>
                {body}
                {actionError && <p className="text-xs text-loss text-center mt-3">{actionError}</p>}
            </SignedIn>
        </div>
    );
}

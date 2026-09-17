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
    isRoomExpired,
    ROOM_TTL_MS,
} from '../../../../lib/duel/room';
import { getSeasonSquads } from '../../../../lib/data/seasonSquads';
import { simulateChase } from '../../../../lib/game/simulate';
import { TOTAL_SLOTS } from '../../../../lib/game/positions';
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

export default function DuelRoomPage({ params }) {
    const { roomId } = params;
    const { user, isSignedIn, isLoaded } = useUser();
    const [room, setRoom] = useState(undefined); // undefined = loading, null = not found
    const [picks, setPicks] = useState([]);
    const [actionError, setActionError] = useState(null);
    const simulateAttempted = useRef(false);

    useEffect(() => {
        const unsubRoom = subscribeToRoom(roomId, setRoom);
        const unsubPicks = subscribeToPicks(roomId, setPicks);
        return () => {
            unsubRoom();
            unsubPicks();
        };
    }, [roomId]);

    const myUid = user?.id;
    const seasonSquads = room ? getSeasonSquads(room.team) : {};

    useEffect(() => {
        if (!room || room.status !== 'simulating' || simulateAttempted.current) return;
        simulateAttempted.current = true;

        const hostOrder = buildBattingOrder(picks, room.hostUid, seasonSquads);
        const guestOrder = buildBattingOrder(picks, room.guestUid, seasonSquads);
        const hostResult = simulateChase(hostOrder);
        const guestResult = simulateChase(guestOrder, Math.random, hostResult.finalScore);
        const winnerUid = guestResult.won ? room.guestUid : room.hostUid;

        finalizeResult(roomId, {
            hostResult,
            guestResult,
            winnerUid,
            hostUid: room.hostUid,
            guestUid: room.guestUid,
            team: room.team,
        }).catch((err) => setActionError(err.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.status]);

    async function handleJoin() {
        try {
            await joinRoom(roomId, { guestUid: myUid, guestName: user.fullName || user.username || 'Player' });
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

    let body;

    if (!isLoaded || room === undefined) {
        body = <p className="text-sm text-textMuted text-center">Loading room…</p>;
    } else if (room === null) {
        body = <p className="text-sm text-loss text-center">This room doesn't exist.</p>;
    } else if (room.status === 'waiting' && isRoomExpired(room)) {
        body = <p className="text-sm text-loss text-center">This invite has expired (invites last {ROOM_TTL_MS / 60000} minutes).</p>;
    } else if (room.status === 'waiting') {
        body =
            myUid === room.hostUid ? (
                <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">Waiting for an opponent to join…</p>
                    <p className="text-xs text-textMuted text-center break-all">Share this link: {typeof window !== 'undefined' ? window.location.href : ''}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">{room.hostName} has challenged you to a 300 Par duel ({room.team}).</p>
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
            <DuelDraftBoard room={room} myUid={myUid} seasonSquads={seasonSquads} picks={picks} onSubmitPick={handleSubmitPick} />
        );
    } else if (room.status === 'simulating') {
        body = <p className="text-sm text-textMuted text-center">Both squads are set — simulating the duel…</p>;
    } else if (room.status === 'complete') {
        body = <DuelResult room={room} />;
    }

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-10 bg-bg min-h-screen">
            <h1 className="text-2xl sm:text-3xl font-display text-text text-center uppercase tracking-wide mb-2">
                300 Par · 1v1 Duel
            </h1>
            {room && room.hostName && room.guestName && (
                <p className="text-sm text-textMuted text-center mb-6">
                    {room.hostName}'s {room.team} vs {room.guestName}'s {room.team}
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
